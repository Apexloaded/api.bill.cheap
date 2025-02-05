import { Injectable } from '@nestjs/common';
import { customActionProvider, EvmWalletProvider } from '@coinbase/agentkit';
import { z } from 'zod';
import { GatewayService } from 'src/contract/gateway/gateway.service';
import { to0xString } from 'src/utils/helpers';
import { PayAirtimeBill } from './interfaces/airtime-bill.interface';
import { BillProvider } from '@/bill/bill.provider';
import { BillType } from '@/bill/entities/bill.entity';
import * as fs from 'fs';
import { Provider } from '@/bill/types/provider.type';
import {
  Mode,
  TopUpBillSchema,
} from './actions/billcheap/schemas/process-bill.schema';

@Injectable()
export class AgentKitAction {
  private topUpDataSourceFile: string = 'top-up-data-source.json';
  private topUpData: string | null = null;
  private handler = {
    [BillType.AIRTIME]: this.billProvider.selectAirtimeProvider,
    [BillType.MOBILE_DATA]: this.billProvider.selectMobileDataProvider,
  };
  private desc = {
    [BillType.AIRTIME]: 'Airtime Topup',
    [BillType.MOBILE_DATA]: 'Mobile Data',
  };

  constructor(
    private gateway: GatewayService,
    private billProvider: BillProvider,
  ) {
    if (fs.existsSync(this.topUpDataSourceFile)) {
      try {
        this.topUpData = fs.readFileSync(this.topUpDataSourceFile, 'utf8');
      } catch (error) {
        console.error('Error reading providers data:', error);
      }
    }
  }
  processTopupActionProvider(payload: PayAirtimeBill) {
    const { id, walletAddress } = payload;

    return customActionProvider<EvmWalletProvider>({
      name: 'global_topup',
      description: `
        Get all the details you need to process mobile data or airtime topup accross the 150+ countries

        Required:
        - providerName: Network operator name. Return '' if not explicity provided by user
        - isoCode: ISO code (e.g. NG, GH, GB)
        - phoneNumber: International format
        - callingCode: Country calling code
        - billType: AIRTIME/MOBILE_DATA
        - amount: Top-up value. Return '' if not explicity provided by user
        - mode: GET/POST Determine the mode type base on users prompt
        - tokenAddress: ERC20 token contract address for payment use default Native ETH address if not specified by user
        - isLocal: if isoCode is NG then isLocal=true else isLocal=false

        Supports 750+ operators in 150+ countries
        Validates limits and operator status

        Note: Always confirm from user before processing POST requests mode
      `,
      schema: TopUpBillSchema,
      invoke: async (walletProvider, args: z.infer<typeof TopUpBillSchema>) => {
        let {
          billType,
          isoCode,
          providerName,
          mode,
          amount,
          phoneNumber,
          tokenAddress,
        } = args;
        console.log('---- INFO SOURCE ----');
        if (this.topUpData !== null) {
          const providerList = JSON.parse(this.topUpData) as Provider[];
          const { selectedProvider } = this.handler[billType]({
            providers: providerList,
            inputedProviderName: providerName,
            isoCode,
          });

          switch (mode) {
            case Mode.GET: {
              if (selectedProvider.length === 0) {
                return 'No providers found for the given criteria.';
              }
              return {
                providers: JSON.stringify(selectedProvider, null, 2),
                ...args,
              };
            }

            case Mode.POST: {
              if (amount && phoneNumber) {
                console.log(selectedProvider);
                const firstProvider = selectedProvider[0];
                const tx = await this.billProvider.generateBillTransaction({
                  userId: id,
                  billType,
                  amount,
                  providerName: firstProvider?.name,
                  provider: firstProvider?.id.toString(),
                  logoUrl: firstProvider?.logoUrls[0] ?? '',
                  isoCode,
                  phoneNumber,
                  token: tokenAddress,
                  currencySymbol: firstProvider.destinationCurrencyCode,
                });

                const value = await this.gateway.processBill(walletProvider, {
                  amount: BigInt(amount),
                  externalTxId: to0xString(''),
                  billId: to0xString(''),
                  providerId: to0xString(''),
                  tokenAddress: to0xString(tokenAddress),
                  txType: 1,
                  billType: 1,
                });

                return `Transaction ID: `;
              }

              return 'Provide amount and phone number';
            }
          }
        }
        return `This interaction should pay bills`;
      },
    });
  }
}
