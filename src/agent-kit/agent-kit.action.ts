import { Injectable } from '@nestjs/common';
import {
  customActionProvider,
  EvmWalletProvider,
} from '@coinbase/agentkit';
import { z } from 'zod';
import { GatewayService } from 'src/contract/gateway/gateway.service';
import { to0xString } from 'src/utils/helpers';

@Injectable()
export class AgentKitAction {
  constructor(private gateway: GatewayService) {}

  get payBills() {
    return customActionProvider<EvmWalletProvider>({
      name: 'process_bill',
      description: 'Process bill payment onchain',
      schema: z.object({
        amount: z.string().describe('The amount to pay'),
        phoneNumber: z.string().describe('The phone number of the recipient'),
        provider: z.string().describe('The service providers name'),
      }),
      invoke: async (walletProvider, args: any) => {
        const { amount, phoneNumber, provider, token } = args;
        const value = await this.gateway.processBill(walletProvider, {
          amount: BigInt(amount),
          externalTxId: to0xString(''),
          billId: to0xString(''),
          providerId: to0xString(''),
          tokenAddress: to0xString(token),
          txType: 1,
          billType: 1,
        });
        return `This interaction should pay bills`;
      },
    });
  }
}
