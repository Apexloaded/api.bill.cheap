import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  Network,
} from '@coinbase/agentkit';
import { z } from 'zod';
import { TopUpBillSchema, Mode } from './schemas/process-bill.schema';
import { BillProvider } from '@/bill/bill.provider';
import { BillType } from '@/bill/entities/bill.entity';
import { Provider, SelectProvider } from '@/bill/types/provider.type';
import { BillcheapActionProviderConfig } from './billcheap.types';
import * as fs from 'fs';
import { to0xString } from '@/utils/helpers';
import { GatewayService } from '@/contract/gateway/gateway.service';
import { proccessTopUpModifier } from './modifers/process-topup.modifier';

export class BillcheapActionProvider extends ActionProvider<EvmWalletProvider> {
  private handler: Record<
    string,
    (data: SelectProvider) => {
      selectedProvider: Provider[];
    }
  > = {};

  private gateway: GatewayService;
  private billProvider: BillProvider;

  private userId: string;
  private topUpDataSourceFile: string = 'top-up-data-source.json';
  private topUpData: string | null = null;

  constructor(config: BillcheapActionProviderConfig = {}) {
    super('billcheap', []);

    this.userId = config.userId;
    this.billProvider = config.billProvider;
    this.handler = {
      [BillType.AIRTIME]: this.billProvider.selectAirtimeProvider,
      [BillType.MOBILE_DATA]: this.billProvider.selectMobileDataProvider,
    };

    if (fs.existsSync(this.topUpDataSourceFile)) {
      try {
        this.topUpData = fs.readFileSync(this.topUpDataSourceFile, 'utf8');
      } catch (error) {
        console.error('Error reading providers data:', error);
      }
    }
  }

  @CreateAction({
    name: 'process_topup',
    description: proccessTopUpModifier,
    schema: TopUpBillSchema,
  })
  async processTopUp(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof TopUpBillSchema>,
  ) {
    try {
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
                userId: this.userId,
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

              // const value = await this.gateway.processBill(walletProvider, {
              //   amount: BigInt(amount),
              //   externalTxId: to0xString(''),
              //   billId: to0xString(''),
              //   providerId: to0xString(''),
              //   tokenAddress: to0xString(tokenAddress),
              //   txType: 1,
              //   billType: 1,
              // });
              return `Transaction ID:`;
            }

            return 'Provide amount and phone number';
          }
        }

        // if (selectedProvider.length === 0) {
        //   return 'No providers found for the given criteria.';
        // }

        // // Extract first provider details (assuming single or most relevant provider)
        // const firstProvider = selectedProvider[0];
        // args.providerId = firstProvider?.id;
        // args.providerName = firstProvider?.name;
        // args.providerLogoUrl = firstProvider?.logoUrls[0] || '';

        // const response = {
        //   providers: JSON.stringify(selectedProvider, null, 2),
        //   ...args,
        // };
        // return response;
      }
      return 'No provider data available';
    } catch (error) {
      return `Error generating billing data: ${error}`;
    }
  }

  supportsNetwork(_: Network): boolean {
    return true;
  }
}

export const billcheapActionProvider = (
  config: BillcheapActionProviderConfig = {},
) => new BillcheapActionProvider(config);
