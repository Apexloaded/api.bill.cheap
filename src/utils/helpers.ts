import { Hex } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import ShortUniqueId from 'short-unique-id';
import type { Provider } from '@/bill/types/provider.type';

export const getProtocol = (url: string) => {
  return `https://${url}`;
};

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isDebug = process.env.NODE_ENV === 'debugging';
export const getAppChain = baseSepolia;
export const getChainName = isDev
  ? getAppChain['network']
  : base.name.toLowerCase();

export function to0xString(value: string) {
  return value as Hex;
}

export const generateId = ({
  length = 6,
  ...prop
}: Partial<ShortUniqueId.ShortUniqueIdOptions>) => {
  const uid = new ShortUniqueId({ length, ...prop });
  return uid.randomUUID();
};
export function getPercentage(from: number, percentage: number): number {
  const perc = (from * percentage) / 100;
  return perc;
}

export function determineAmountCurrency(
  provider: Provider,
  amount: number,
  isForeignTx: boolean,
): 'local' | 'foreign' {
  if (provider.denominationType === 'FIXED') {
    if (isForeignTx) {
      return provider.localFixedAmounts.includes(amount) ? 'local' : 'foreign';
    } else {
      return provider.fixedAmounts.includes(amount) ? 'foreign' : 'local';
    }
  } else {
    // RANGE
    if (isForeignTx) {
      return amount >= provider.localMinAmount &&
        amount <= provider.localMaxAmount
        ? 'local'
        : 'foreign';
    } else {
      return amount >= provider.minAmount && amount <= provider.maxAmount
        ? 'foreign'
        : 'local';
    }
  }
}

export function formatProvidersToAgentsData(providers: Provider[]) {
  return providers.map((p) => {
    return formatSingleProvider(p);
  });
}

export function formatSingleProvider(provider: Provider) {
  if (provider.destinationCurrencyCode.toLowerCase() !== 'ngn') {
    if (provider.denominationType === 'RANGE') {
      provider.minAmount = provider.localMinAmount;
      provider.maxAmount = provider.localMaxAmount;
      provider.suggestedAmounts = generateUniqueRandomArray(
        provider.localMinAmount,
        provider.localMaxAmount,
        8,
      );
      provider.mostPopularAmount = provider.suggestedAmounts.length[6];
    }
    if (provider.denominationType === 'FIXED') {
      provider.mostPopularAmount = provider.mostPopularLocalAmount;
      provider.fixedAmounts = provider.localFixedAmounts;
      provider.fixedAmountsDescriptions =
        provider.localFixedAmountsDescriptions;
    }
  }
  return provider;
}

export function generateUniqueRandomArray(
  start: number,
  end: number,
  length: number,
) {
  if (end - start + 1 < length) {
    throw new Error('Range is too small to generate unique numbers.');
  }

  const randomSet = new Set<number>();

  while (randomSet.size < length) {
    const randomNumber = Math.floor(Math.random() * (end - start + 1)) + start;
    randomSet.add(randomNumber);
  }

  // Convert the set to an array and sort it in ascending order
  return Array.from(randomSet).sort((a, b) => a - b);
}

export function stringify(data: any) {
  return JSON.stringify(data, null, 2);
}
