import {
  ActionProvider,
  CreateAction,
  EvmWalletProvider,
  Network,
  ViemWalletProvider,
} from '@coinbase/agentkit';
import { BCUtilityActionConfig } from './utility.types';
import { UtilityProvider } from '@/bill/utility/utility.provider';
import { GatewayService } from '@/contract/gateway/gateway.service';
import { z } from 'zod';
import {
  FindUtilitySchema,
  ProcessUtilitySchema,
} from './schemas/utility.schema';
import { findUtilityModifier } from './modifiers/find-utility';
import { LRUCache } from 'lru-cache';
import { stringify } from '@/utils/helpers';
import { UtitliyOperators } from '@/bill/utility/types/utility.type';
import { processUtilityModifer } from './modifiers/process-utility';
import { BillProvider } from '@/bill/bill.provider';
import { isAddress } from 'viem';
import { invalidAddressModifier } from '@/agent-kit/modifiers/invalid-address.modifier';
import { insufficientBalanceModifier } from '../topup/modifers/insufficient-balance.modifier';
import { getBillType } from '@/bill/utility/entities/utility.entity';

export class BillcheapUtilityActionProvider extends ActionProvider<EvmWalletProvider> {
  private multiCacheInit = new LRUCache<string, UtitliyOperators[]>({
    max: 100,
    ttl: 10 * 60 * 1000, // 10 minutes
  });
  private singleCacheInit = new LRUCache<string, UtitliyOperators>({
    max: 100,
    ttl: 10 * 60 * 1000, // 10 minutes
  });
  private allOperators = this.multiCacheInit;
  private isoCacheMemory = this.multiCacheInit;
  private isoNameCacheMemory = this.multiCacheInit;

  private gateway: GatewayService;
  private provider: UtilityProvider;
  private billProvider: BillProvider;

  private userId: string;

  constructor(config: BCUtilityActionConfig = {}) {
    super('utility', []);

    this.userId = config.userId;
    this.provider = config.provider;
    this.gateway = config.gateway;
    this.billProvider = config.billProvider;
  }

  @CreateAction({
    name: 'find_utility_operators',
    description: findUtilityModifier,
    schema: FindUtilitySchema,
  })
  async findOperators(args: z.infer<typeof FindUtilitySchema>) {
    try {
      console.log('UTILITY ENDPOINT');
      console.log(args);
      const name = args.name?.split(' ')[0]?.toLowerCase() || '';
      const isoNameCacheKey =
        `${args.countryISOCode}-${name}-${args.serviceType}`.toLowerCase();
      const cachedValue = this.isoNameCacheMemory.get(isoNameCacheKey) ?? [];

      // Fetch providers from cache if available else make api call
      let operators = cachedValue.length
        ? cachedValue
        : await this.getProviders(args);
      if (!operators.length) return 'No Providers Available';

      // Filter by provider name if requested
      const data = operators.filter((p) => p.name.toLowerCase().includes(name));
      if (data.length) {
        this.isoNameCacheMemory.set(isoNameCacheKey, data);
        operators = data;
      }

      return {
        providers: stringify(operators),
        ...args,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  @CreateAction({
    name: 'process_utility_bill',
    description: processUtilityModifer,
    schema: ProcessUtilitySchema,
  })
  async processUtilityBill(
    wallet: ViemWalletProvider,
    args: z.infer<typeof ProcessUtilitySchema>,
  ) {
    try {
      console.log('UTILITY PROCESSING ENDPOINT');
      console.log(args);
      const name = args.name?.split(' ')[0]?.toLowerCase() || '';
      const isoNameCacheKey =
        `${args.countryISOCode}-${name}-${args.serviceType}`.toLowerCase();
      const cachedValue = this.isoNameCacheMemory.get(isoNameCacheKey) ?? [];

      // Verify that users ISO is defined
      if (!args.countryISOCode)
        return `Which country ${args.name} service providers are you interested in?`;

      if (!args.amount || !args.accountNumber)
        return 'Amount and account number is required to process utility bill.';

      // Fetch providers from cache if available else make api call
      let operators = cachedValue.length
        ? cachedValue
        : await this.getProviders(args);
      const operator = operators.find((op) => op.id == args.id);
      if (!operator) return 'No Service Provider Available';

      return await this.executeTransaction(wallet, args, operator);
    } catch (error) {
      console.log(error);
      return {
        error: error.message,
      };
    }
  }

  private async getProviders(args: z.infer<typeof FindUtilitySchema>) {
    const { name, serviceType, type, countryISOCode } = args;
    const isoCacheKey =
      `${countryISOCode}-${serviceType}-${type}`.toLowerCase();
    let providers = this.isoCacheMemory.get(isoCacheKey) ?? [];

    if (!providers.length) {
      providers = await this.provider.listAllProviders(args);
      if (providers.length) this.isoCacheMemory.set(isoCacheKey, providers);
    }
    return providers;
  }

  private async executeTransaction(
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof ProcessUtilitySchema>,
    operator: UtitliyOperators,
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
      operator.localTransactionCurrencyCode,
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
      billType: getBillType[args.type],
      amount,
      providerName: operator?.name,
      provider: operator?.id.toString(),
      logoUrl: '',
      isoCode: args.countryISOCode,
      accountNumber: args.accountNumber,
      token: tokenAddress,
      currencySymbol: operator.localTransactionCurrencyCode,
    });
    return await this.gateway.processBill(walletProvider, tx);
  }

  supportsNetwork(_: Network): boolean {
    return true;
  }
}

export const bcUtitliyActionProvider = (config: BCUtilityActionConfig = {}) =>
  new BillcheapUtilityActionProvider(config);
