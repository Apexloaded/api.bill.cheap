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
}
