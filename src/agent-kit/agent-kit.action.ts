import { Injectable } from '@nestjs/common';
import { AgentKitService } from './agent-kit.service';
import {
  customActionProvider,
  EvmWalletProvider,
  ViemWalletProvider,
} from '@coinbase/agentkit';
import { bigint, z } from 'zod';
import { GatewayService } from 'src/contract/gateway/gateway.service';
import { to0xString } from 'src/utils/helpers';

@Injectable()
export class AgentKitAction {
  constructor(private gateway: GatewayService) {}

  get customSignMessage() {
    return customActionProvider<EvmWalletProvider>({
      // wallet types specify which providers can use this action. It can be as generic as WalletProvider or as specific as CdpWalletProvider
      name: 'sign_message',
      description:
        'Sign arbitrary messages using EIP-191 Signed Message Standard hashing',
      schema: z.object({
        message: z.string().describe('The message to sign'),
      }),
      invoke: async (walletProvider, args: any) => {
        const { message } = args;
        const signature = await walletProvider.signMessage(message);
        return `The payload signature ${signature}`;
      },
    });
  }

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
