import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  HDAccount,
  http,
  publicActions,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import {
  createBundlerClient,
  toCoinbaseSmartAccount,
} from 'viem/account-abstraction';

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

  bundlerClient(account: HDAccount) {
    return createBundlerClient({
      account,
      //@ts-ignore
      client: this.getPublicClient(),
      transport: http(this.rpcUrl),
      chain: baseSepolia,
    });
  }

  async smartAccount(owner: HDAccount) {
    const account = await toCoinbaseSmartAccount({
      //@ts-ignore
      client: this.client.getPublicClient(),
      owners: [owner],
    });
    return account;
  }
}

