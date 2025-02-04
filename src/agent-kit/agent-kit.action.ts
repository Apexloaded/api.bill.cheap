import { Injectable } from '@nestjs/common';
import { customActionProvider, EvmWalletProvider } from '@coinbase/agentkit';
import { z } from 'zod';
import { GatewayService } from 'src/contract/gateway/gateway.service';
import { to0xString } from 'src/utils/helpers';
import { ReloadlyService } from '@/reloadly/reloadly.service';
import { Hex } from 'viem';
import { PayAirtimeBill } from './interfaces/airtime-bill.interface';
import { processTopupModifierV2 } from './modifiers/process-topup.modifier';
import { ProcessTopupSchema } from './schemas/process-bill.schema';

@Injectable()
export class AgentKitAction {
  constructor(
    private gateway: GatewayService,
    private reloadly: ReloadlyService,
  ) {}
  processTopup(payload: PayAirtimeBill) {
    const { id, walletAddress } = payload;

    return customActionProvider<EvmWalletProvider>({
      name: 'global_topup',
      description: processTopupModifierV2,
      schema: ProcessTopupSchema,
      invoke: async (
        walletProvider,
        args: z.infer<typeof ProcessTopupSchema>,
      ) => {
        const {
          amount,
          billType,
          tokenAddress,
          phoneNumber,
          provider,
          callingCode,
          isLocal,
          isoCode,
        } = args;
        // const value = await this.gateway.processBill(walletProvider, {
        //   amount: BigInt(amount),
        //   externalTxId: to0xString(''),
        //   billId: to0xString(''),
        //   providerId: to0xString(''),
        //   tokenAddress: to0xString(tokenAddress),
        //   txType: 1,
        //   billType: 1,
        // });
        return `This interaction should pay bills`;
      },
    });
  }
}
