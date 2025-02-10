import { Injectable } from '@nestjs/common';
import { ContractClient } from '../contract.client';
import { createBundlerClient, toCoinbaseSmartAccount } from 'viem/account-abstraction';
import { privateKeyToAccount } from 'viem/accounts';
import { Hex } from 'viem';

@Injectable()
export class PaymasterService {
  constructor(private client: ContractClient) {}
  async getOwnerAccount(privateKey: Hex) {
    const owner = privateKeyToAccount(privateKey);
    const account = await toCoinbaseSmartAccount({
      //@ts-ignore
      client: this.client.getPublicClient(),
      owners: [owner],
    });
    return account;
  }
}
