import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  Network,
  ViemWalletProvider,
} from '@coinbase/agentkit';
import { z } from 'zod';
import { TopUpBillSchema } from './schemas/process-bill.schema';
import { BillProvider } from '@/bill/bill.provider';
import { BillType } from '@/bill/entities/bill.entity';
import { Provider, SelectProvider } from '@/bill/types/provider.type';
import { BillcheapActionProviderConfig } from './topup.types';
import {
  determineAmountCurrency,
  formatProvidersToAgentsData,
  formatSingleProvider,
  stringify,
  to0xString,
} from '@/utils/helpers';
import { GatewayService } from '@/contract/gateway/gateway.service';
import { proccessTopUpModifier } from './modifers/process-topup.modifier';
import { LRUCache } from 'lru-cache';
import {
  encodeFunctionData,
  erc20Abi,
  Hex,
  isAddress,
  parseEther,
  zeroAddress,
} from 'viem';
import gatewayAbi from '@/contract/gateway/abis/gateway.abi';
import { findTopUpModifier } from './modifers/find-topup.modifier';
import { invalidAddressModifier } from './modifers/invalid-address.modifier';
import { insufficientBalanceModifier } from './modifers/insufficient-balance.modifier';
import { InitBill } from '@/bill/types/init-bill.type';

export class BillcheapTopUpActionProvider extends ActionProvider<EvmWalletProvider> {
  private multiCacheInit = new LRUCache<string, Provider[]>({
    max: 100,
    ttl: 10 * 60 * 1000, // 10 minutes
  });
  private singleCacheInit = new LRUCache<string, Provider>({
    max: 100,
    ttl: 10 * 60 * 1000, // 10 minutes
  });
  private isoCacheMemory = this.multiCacheInit;
  private isoNameCacheMemory = this.multiCacheInit;
  private autoDetectCachMemory = this.singleCacheInit;

  private handler: Record<
    string,
    (data: SelectProvider) => { selectedProvider: Provider[] }
  >;
  private gateway: GatewayService;
  private billProvider: BillProvider;

  private userId: string;

  constructor(config: BillcheapActionProviderConfig = {}) {
    super('billcheap', []);

    this.userId = config.userId;
    this.billProvider = config.billProvider;
    this.gateway = config.gateway;
    this.handler = {
      [BillType.AIRTIME]: this.billProvider.selectAirtimeProvider,
      [BillType.MOBILE_DATA]: this.billProvider.selectMobileDataProvider,
    };
  }

  @CreateAction({
    name: 'find_operators',
    description: findTopUpModifier,
    schema: TopUpBillSchema,
  })
  async findOperators(args: z.infer<typeof TopUpBillSchema>) {
    try {
      const name = args.providerName?.split(' ')[0]?.toLowerCase() || '';
      const isoNameCacheKey =
        `${args.isoCode}-${name}-${args.billType}`.toLowerCase();
      const cachedValue = this.isoNameCacheMemory.get(isoNameCacheKey) ?? [];

      // Verify that users ISO is defined
      if (!args.isoCode)
        return `Which country ${name} service providers are you interested in?`;

      // Fetch providers from cache if available else make api call
      let providers = cachedValue.length
        ? cachedValue
        : await this.getProviders(args);
      if (!providers.length) return 'No Providers Available';

      // Filter by provider name if requested
      const data = providers.filter((p) => p.name.toLowerCase().includes(name));
      if (data.length) {
        this.isoNameCacheMemory.set(isoNameCacheKey, data);
        providers = data;
      }

      return {
        providers: stringify(providers),
        ...args,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  @CreateAction({
    name: 'process_topup',
    description: proccessTopUpModifier,
    schema: TopUpBillSchema,
  })
  async processTopUp(
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof TopUpBillSchema>,
  ) {
    try {
      let { billType, amount, pin, isForeignTx } = args;

      const name = args.providerName?.split(' ')[0]?.toLowerCase() || '';
      const isoNameCacheKey =
        `${args.isoCode}-${name}-${args.billType}`.toLowerCase();
      const authDetectCacheKey =
        `${args.isoCode}-${args.phoneNumber}`.toLowerCase();
      const cachedValue = this.isoNameCacheMemory.get(isoNameCacheKey) ?? [];
      const cachedAutoDetect =
        this.autoDetectCachMemory.get(authDetectCacheKey);

      // Verify that users ISO is defined
      if (!args.isoCode)
        return `Which country ${name} service providers are you interested in?`;

      if (!args.amount || !args.phoneNumber)
        return 'Amount and phone number required for top-up.';

      // Fetch providers from cache if available else make api call
      let providers = cachedValue.length
        ? cachedValue
        : await this.getProviders(args);
      if (!providers.length) return 'No Providers Available';

      const autoDetectProvider = cachedAutoDetect
        ? cachedAutoDetect
        : await this.billProvider.autoDetectProvider(
            args.phoneNumber,
            args.isoCode.toUpperCase(),
          );

      if (autoDetectProvider) {
        const formattedProvider = formatSingleProvider(autoDetectProvider);
        if (billType === BillType.AIRTIME) {
          args.providerName = formattedProvider.name;
          args.providerId = formattedProvider.id;
          args.providerLogoUrl = formattedProvider.logoUrls[0] ?? '';
          this.autoDetectCachMemory.set(authDetectCacheKey, formattedProvider);
        }
        if (!formattedProvider.name.toLowerCase().includes(name)) {
          const { selectedProvider } = this.handler[billType]({
            providers,
            inputedProviderName: formattedProvider.name.split(' ')[0],
            isoCode: args.isoCode,
            pin,
          });
          const response = {
            message: `Phone number and operator mismatch, the returned provider is the suggestted accurated provider for ${args.phoneNumber}, kindly choose another plan from your provider`,
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
        inputedProviderName: name,
        isoCode: args.isoCode,
        pin,
      });
      if (!selectedProvider.length) return 'No providers found.';

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

      const bestProvider = validProviders.find((p) => p.id === args.providerId);
      if (!bestProvider) return 'Provider not found in the selected providers.';

      // Check if the token is available in the account balance

      const amountCurrencyType = determineAmountCurrency(
        bestProvider,
        Number(amount),
        isForeignTx,
      );

      return await this.executeTransaction(walletProvider, args, bestProvider);
    } catch (error) {
      console.log(error);
      return `Error generating billing data: ${error}`;
    }
  }

  private async getProviders(args: z.infer<typeof TopUpBillSchema>) {
    const { isoCode, pin, billType, isForeignTx } = args;
    const isData = billType == BillType.MOBILE_DATA;
    const includePin = isForeignTx || pin;
    const isoCacheKey = `${isoCode}-${isData}-${includePin}`.toLowerCase();
    let providers = this.isoCacheMemory.get(isoCacheKey) ?? [];

    if (!providers.length) {
      providers = formatProvidersToAgentsData(
        await this.billProvider.listProvidersByISO(
          isoCode.toUpperCase(),
          true,
          true,
          isForeignTx || pin,
          isData,
          isData,
        ),
      );
      if (providers.length) this.isoCacheMemory.set(isoCacheKey, providers);
    }
    return providers;
  }

  private async executeTransaction(
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof TopUpBillSchema>,
    provider: Provider,
  ) {
    const { amount, tokenAddress } = args;
    const accountBalance = await this.billProvider.listPaymentTokens(
      walletProvider.getAddress(),
    );

    if (!isAddress(tokenAddress)) {
      const response = {
        message: invalidAddressModifier,
        tokenBalances: JSON.stringify(accountBalance, null, 2),
        ...args,
      };
      return response;
    }

    const tokenBalance = accountBalance.find(
      (b) => b.address.toLowerCase() === tokenAddress.toLowerCase(),
    );
    if (!tokenBalance)
      return `Token address ${tokenAddress} not found in your account balance.`;

    const checkUsdValue = await this.billProvider.verifyBalance(
      amount,
      provider.destinationCurrencyCode,
    );
    if (parseFloat(tokenBalance.balanceInUsd) <= checkUsdValue) {
      const response = {
        message: insufficientBalanceModifier(tokenAddress),
        tokenBalances: JSON.stringify(accountBalance, null, 2),
        ...args,
      };
      return response;
    }

    const tx = await this.billProvider.generateBillTransaction({
      userId: this.userId,
      billType: args.billType,
      amount,
      providerName: provider?.name,
      provider: provider?.id.toString(),
      logoUrl: provider?.logoUrls[0] ?? '',
      isoCode: args.isoCode,
      phoneNumber: args.phoneNumber,
      token: tokenAddress,
      currencySymbol: provider.destinationCurrencyCode,
    });

    return await this.gateway.processBill(walletProvider, tx);
  }

  private async processPayment(
    walletProvider: ViemWalletProvider,
    tx: InitBill,
  ) {
    const contract = this.gateway.geteway;
    const isNativeToken = tx.tokenAddress === zeroAddress;
    if (!isNativeToken) {
      const approvalHash = await walletProvider.sendTransaction({
        to: tx.tokenAddress as Hex,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [contract as Hex, parseEther(`${tx.cryptoValue}`)],
        }),
      });
      await walletProvider.waitForTransactionReceipt(approvalHash);
    }

    const hash = await walletProvider.sendTransaction({
      to: contract as Hex,
      data: encodeFunctionData({
        abi: gatewayAbi,
        functionName: 'processBill',
        args: [
          parseEther(`${tx.cryptoValue}`),
          to0xString(tx.transactionId),
          to0xString(tx.billId),
          to0xString(tx.providerId),
          to0xString(tx.tokenAddress),
          tx.transactionType,
          tx.billType,
        ],
      }),
      ...(isNativeToken && { value: parseEther(`${tx.cryptoValue}`) }),
    });
    await walletProvider.waitForTransactionReceipt(hash);
    return `Success Transaction ${hash}`;
  }

  supportsNetwork(_: Network): boolean {
    return true;
  }
}

export const billcheapTopupActionProvider = (
  config: BillcheapActionProviderConfig = {},
) => new BillcheapTopUpActionProvider(config);
