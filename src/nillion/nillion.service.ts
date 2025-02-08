import {
  Injectable,
  NotFoundException,
  NotImplementedException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrgConfig, NillionNodes } from './types/org.type';
import { createJWT, ES256KSigner } from 'did-jwt';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Nillion, Tables } from './entities/nillion.entity';
import { Model } from 'mongoose';
import { NillionApi } from './nillion.api';
import { nilql } from '../utils/nilql';

@Injectable()
export class NillionService {
  private orgConfig: OrgConfig;
  private ttl = 3600; // 1 hour in seconds

  constructor(
    @InjectModel(Nillion.name) private model: Model<Nillion>,
    private config: ConfigService,
    private nillionApi: NillionApi,
  ) {
    this.orgConfig = {
      secret: config.get<string>('nillion.secret'),
      orgDid: config.get<string>('nillion.orgDid'),
      nodes: this.config.get<NillionNodes[]>('nillion.nodes'),
    };
  }

  async createJWT() {
    const signer = ES256KSigner(Buffer.from(this.orgConfig.secret, 'hex'));
    const issuedAt = Math.floor(Date.now() / 1000);
    const exp = issuedAt + this.ttl;

    return Promise.all(
      this.orgConfig.nodes.map(async (nodeId) => {
        const payload = { iss: this.orgConfig.orgDid, aud: nodeId.did, exp };
        return createJWT(payload, { issuer: this.orgConfig.orgDid, signer });
      }),
    );
  }

  async createSchema<T>(name: string, schema: T) {
    try {
      const schemaId = uuidv4();
      const payload = {
        _id: schemaId,
        name: name,
        keys: ['_id'],
        schema,
      };
      const nodeJwts = await this.createJWT();
      const authConfig = this.mapNodesToConfig(this.orgConfig.nodes, nodeJwts);
      this.validateAuthConfig(authConfig);

      const results = await this.nillionApi.post(
        'schemas',
        payload,
        authConfig,
      );
      if (results.every(Boolean)) {
        await this.model.findOneAndUpdate(
          { table: Tables.wallet },
          {
            $setOnInsert: {
              schemaId,
              name,
              table: Tables.wallet,
            },
          },
          { upsert: true, new: true },
        );
        return { success: true, results };
      }
    } catch (err) {
      throw new Error('Failed to create schemas');
    }
  }

  async readData<T>(filter: any = {}) {
    const table = await this.model.findOne({ table: Tables.wallet });
    if (!table) throw new NotImplementedException('Table not found');

    const nodeJwts = await this.createJWT();
    const authConfig = this.mapNodesToConfig(this.orgConfig.nodes, nodeJwts);
    this.validateAuthConfig(authConfig);

    const payload = {
      schema: table.schemaId,
      filter,
    };
    const results = await this.nillionApi.post<T>(
      'data/read',
      payload,
      authConfig,
    );

    return results.every(Boolean) ? { success: true, results } : null;
  }

  async addData({ wallet, salt }) {
    const [secretKey, table] = await Promise.all([
      this.generateSecret(),
      this.model.findOne({ table: Tables.wallet }),
    ]);

    if (!table) throw new NotImplementedException('Table not found');

    const walletSalt = await nilql.encrypt(secretKey, salt);
    const nodeJwts = await this.createJWT();
    const authConfig = this.mapNodesToConfig(this.orgConfig.nodes, nodeJwts);
    this.validateAuthConfig(authConfig);

    const payload = {
      schema: table.schemaId,
      data: [
        {
          _id: uuidv4(),
          salt: walletSalt,
          wallet,
        },
      ],
    };
    const results = await this.nillionApi.post(
      'data/create',
      payload,
      authConfig,
    );
    return results.every(Boolean) ? { success: true, results } : null;
  }

  async decryptSalt(value: string | string[] | number[]) {
    const secretKey = await this.generateSecret();
    const decryptedValue = await nilql.decrypt(secretKey, value);
    return decryptedValue as string;
  }

  private validateAuthConfig(
    authConfig: Record<string, { url: string; jwt: string }>,
  ) {
    Object.entries(authConfig).forEach(([nodeName, config]) => {
      if (!config.url || config.url.includes('your_node')) {
        throw new NotFoundException(
          `Invalid URL for ${nodeName}: ${config.url}`,
        );
      }
      if (!config.jwt || config.jwt.includes('your_jwt')) {
        throw new NotFoundException(
          `Missing JWT configuration for ${nodeName}`,
        );
      }
    });
  }

  private mapNodesToConfig(nodes: NillionNodes[], nodeJWTs: string[]) {
    if (nodes.length !== nodeJWTs.length) {
      throw new Error('Nodes and JWTs arrays must have the same length');
    }
    return Object.fromEntries(
      nodes.map((node, index) => [
        `node_${String.fromCharCode(97 + index)}`,
        { url: node.url, jwt: nodeJWTs[index] },
      ]),
    );
  }

  private async generateSecret() {
    return nilql.ClusterKey.generate(
      { nodes: this.orgConfig.nodes },
      { store: true },
    );
  }
}
