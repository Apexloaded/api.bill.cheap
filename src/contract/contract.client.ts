import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  PrivateKeyAccount,
  publicActions,
} from 'viem';
import { baseSepolia } from 'viem/chains';

@Injectable()
export class ContractClient {
  private rpcUrl: string;

  constructor(private config: ConfigService) {
    this.rpcUrl = this.config.get<string>('app.rpc');
  }

  getPublicClient() {
    return createPublicClient({
      chain: baseSepolia,
      transport: http(this.rpcUrl),
    });
  }

  getWalletClient(account?: any) {
    return createWalletClient({
      chain: baseSepolia,
      account,
      transport: http(this.rpcUrl),
    }).extend(publicActions);
  }
}
