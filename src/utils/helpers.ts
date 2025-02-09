import { Hex } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import ShortUniqueId from 'short-unique-id';

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
  isUUID = false,
  length = 6,
  ...prop
}: Partial<ShortUniqueId.ShortUniqueIdOptions> & { isUUID?: boolean }) => {
  const uid = new ShortUniqueId({ length, ...prop });
  return isUUID ? uid.stamp(32) : uid.randomUUID();
};

export function getPercentage(from: number, percentage: number): number {
  const perc = (from * percentage) / 100;
  return perc;
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
