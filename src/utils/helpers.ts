import { Hex } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import ShortUniqueId from 'short-unique-id';

export const getProtocol = (url: string) => {
  return `https://${url}`;
};

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isDebug = process.env.NODE_ENV === 'debugging';
export const getAppChain = isDev ? baseSepolia : base;
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
