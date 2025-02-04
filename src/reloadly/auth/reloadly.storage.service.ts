import { Injectable } from '@nestjs/common';
import { AudienceType } from '@/enums/reloadly.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateReloadlyAuthDto } from '../dto/reloadly-auth.dto';
import {
  AuthSession,
  AuthSessionDocument,
} from '@/auth/entities/auth.entity';
import { AuthSessionProvider } from '@/enums/cookie.enum';
import { decrypt } from '@/utils/encrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReloadlyTokenStorageService {
  constructor(
    @InjectModel(AuthSession.name) private readonly model: Model<AuthSession>,
    private readonly config: ConfigService,
  ) {}

  async getAuthToken(key: AudienceType): Promise<AuthSessionDocument> {
    const value = await this.model.findOne({
      audience: key,
      provider: AuthSessionProvider.Reloadly,
    });
    const decrytedToken = await decrypt(
      value.accessToken,
      this.config.get<string>('app.encryptionKey'),
    );
    value.accessToken = decrytedToken;
    return value;
  }

  async setAuthToken(
    body: CreateReloadlyAuthDto,
  ): Promise<AuthSessionDocument> {
    const { audience } = body;
    const filter = { audience };
    const options = { upsert: true, new: true };
    const update = {
      $set: body,
    };
    return this.model.findOneAndUpdate(filter, update, options);
  }

  async deleteAuthToken(key: AudienceType): Promise<void> {
    await this.model.deleteOne({
      audience: key,
      provider: AuthSessionProvider.Reloadly,
    });
  }
}
