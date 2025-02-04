import { Hex } from 'viem';

export function to0xString(value: string) {
  return value as Hex;
}
