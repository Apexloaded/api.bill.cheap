import { Injectable } from '@nestjs/common';
import { AgentKitService } from './agent-kit.service';
import { customActionProvider, EvmWalletProvider } from '@coinbase/agentkit';
import { z } from 'zod';

@Injectable()
export class AgentKitAction {
  constructor() {}

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
      // wallet types specify which providers can use this action. It can be as generic as WalletProvider or as specific as CdpWalletProvider
      name: 'process_bill',
      description: 'Process bill payment onchain',
      schema: z.object({
        amount: z.string().describe('The amount to pay'),
        phoneNumber: z.string().describe('The phone number of the recipient'),
        provider: z.string().describe('The service providers name'),
        // token: z.string().describe('The token address or symbol for payment'),
      }),
      invoke: async (walletProvider, args: any) => {
        const { amount, phoneNumber, provider, token } = args;

        console.log(walletProvider);
        // const contractInvocation = await walletProvider.invokeContract({
        //   contractAddress: '0xYourContractAddress',
        //   method: 'transfer',
        //   args: transferArgs,
        //   abi,
        // });
        console.log(args);
        // const signature = await walletProvider.signMessage(message);
        return `This interaction should pay bills`;
      },
    });
  }
}
