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
import {
  determineAmountCurrency,
  formatProvidersToAgentsData,
  formatSingleProvider,
  to0xString,
} from '@/utils/helpers';
import { GatewayService } from '@/contract/gateway/gateway.service';
import { proccessTopUpModifier } from './modifers/process-topup.modifier';
import { LRUCache } from 'lru-cache';

export class BillcheapActionProvider extends ActionProvider<EvmWalletProvider> {
  private multiProviderCache = new LRUCache<string, Provider[]>({
    max: 10, // Maximum number of items the cache can hold
    ttl: 10 * 60 * 1000, // Time-to-live for cache entries (5 minutes in ms)
  });
  private singleProviderCache = new LRUCache<string, Provider>({
    max: 10, // Maximum number of items the cache can hold
    ttl: 60 * 60 * 1000, // Time-to-live for cache entries (5 minutes in ms)
  });

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
    name: 'billcheap_operator_query',
    description: `
      Retrieves a list of available operators for a given country or service type.

      Required:
      - providerName: Network operator name (Return '' if not provided).
      - isoCode: Two-letter country code (e.g., NG, GB).
      - phoneNumber: International format.
      - callingCode: Country calling code (e.g., +234).
      - billType: AIRTIME or MOBILE_DATA.
      - amount: Top-up value in destination currency (Return '' if not provided).
      - mode: GET or POST (Confirm with user before POST).
      - tokenAddress: ERC20 token contract (Default: Native ETH if not provided).
      - isLocal: true if isoCode === 'NG', else false.
      - pin: (Default: true).
      - isForeignTx: true if isoCode !== 'NG', else false.

      Returns:
      - List of operators available for top-up and data services.
    `,
    schema: TopUpBillSchema,
  })
  async findOperators(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof TopUpBillSchema>,
  ) {
    try {
      console.log('---- OPERATOR QUERY ----', args);

      let { isoCode, providerName, pin, billType, isForeignTx } = args;
      const isData = billType == BillType.MOBILE_DATA;
      const providerKey = providerName?.split(' ')[0]?.toLowerCase() || '';
      const cacheKey = `${isoCode}-${providerKey}-${billType}`.toLowerCase();

      // Check if the result is already cached
      const cachedProviders = this.multiProviderCache.get(cacheKey);
      if (cachedProviders) {
        return {
          providers: JSON.stringify(cachedProviders, null, 2),
          ...args,
        };
      }

      const providers = formatProvidersToAgentsData(
        await this.billProvider.listProvidersByISO(
          isoCode.toUpperCase(),
          true,
          true,
          isForeignTx ? true : pin,
          isData,
          isData,
        ),
      );

      if (!providers.length) return 'No available operators found.';

      // Filter by provider name if requested
      if (providerKey) {
        const filteredProviders = providers.filter((p) =>
          p.name.toLowerCase().includes(providerKey),
        );
        this.multiProviderCache.set(cacheKey, filteredProviders);
        return filteredProviders.length
          ? {
              providers: JSON.stringify(filteredProviders, null, 2),
              ...args,
            }
          : 'No matching operators found.';
      }

      return {
        providers: JSON.stringify(providers, null, 2),
        ...args,
      };
    } catch (error) {
      return `Error fetching provider information: ${error}`;
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
      console.log('---- INFO SOURCE ----', args);

      let {
        billType,
        isoCode,
        providerName,
        mode,
        amount,
        phoneNumber,
        tokenAddress,
        isLocal,
        pin,
        isForeignTx,
      } = args;

      const isData = billType == BillType.MOBILE_DATA;
      const providerKey = providerName?.split(' ')[0]?.toLowerCase() || '';
      const cacheKey = `${isoCode}-${phoneNumber}`.toLowerCase();
      const cachedProviders = this.multiProviderCache.get(cacheKey) || [];
      let providers = [...cachedProviders];

      if (!providers.length) {
        providers = formatProvidersToAgentsData(
          await this.billProvider.listProvidersByISO(
            isoCode.toUpperCase(),
            true,
            true,
            isForeignTx ? true : pin,
            isData,
            isData,
          ),
        );
        this.multiProviderCache.set(cacheKey, providers);
      }
      //console.log(providers);

      const autoDetectProvider = phoneNumber
        ? await this.billProvider.autoDetectProvider(
            phoneNumber,
            isoCode.toUpperCase(),
          )
        : null;

      if (autoDetectProvider) {
        const formattedProvider = formatSingleProvider(autoDetectProvider);
        if (billType === BillType.AIRTIME) {
          args.providerName = formattedProvider.name;
          args.providerId = formattedProvider.id;
          args.providerLogoUrl = formattedProvider.logoUrls[0] ?? '';
        }
        if (!formattedProvider.name.toLowerCase().includes(providerKey)) {
          const { selectedProvider } = this.handler[billType]({
            providers,
            inputedProviderName: formattedProvider.name.split(' ')[0],
            isoCode,
            pin,
          });
          const response = {
            message: `Phone number and operator mismatch, the returned provider is the suggestted accurated provider for ${phoneNumber}, kindly choose another plan from your provider`,
            providers: JSON.stringify(selectedProvider, null, 2),
            ...args,
          };
          return response;
        }
        if (!providers.some((p) => p.id === formattedProvider.id)) {
          providers.push(formattedProvider);
        }
      }

      const { selectedProvider } = this.handler[billType]({
        providers,
        inputedProviderName: providerKey,
        isoCode,
        pin,
      });

      if (!selectedProvider.length) return 'No providers found.';

      if (mode === Mode.GET) {
        return {
          providers: JSON.stringify(selectedProvider, null, 2),
          ...args,
        };
      }

      if (mode === Mode.POST) {
        if (!amount || !phoneNumber)
          return 'Amount and phone number required for top-up.';

        const validProviders = selectedProvider.filter((provider) => {
          const amountNum = Number(amount);
          const currencyType = determineAmountCurrency(
            provider,
            amountNum,
            isForeignTx,
          );
          return currencyType === (isForeignTx ? 'local' : 'foreign');
        });

        if (!validProviders.length)
          return `No providers found for amount: ${amount}`;

        const bestProvider = validProviders.find(
          (p) => p.id === args.providerId,
        );

        if (!bestProvider) {
          return 'Provider not found in the selected providers.';
        }

        // const firstProvider =
        //   validProviders.find((p) => p.denominationType === 'FIXED') ||
        //   validProviders[0];

        const amountCurrencyType = determineAmountCurrency(
          bestProvider,
          Number(amount),
          isForeignTx,
        );

        const tx = await this.billProvider.generateBillTransaction({
          userId: this.userId,
          billType,
          amount,
          providerName: bestProvider?.name,
          provider: bestProvider?.id.toString(),
          logoUrl: bestProvider?.logoUrls[0] ?? '',
          isoCode,
          phoneNumber,
          token: tokenAddress,
          currencySymbol: bestProvider.destinationCurrencyCode,
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
