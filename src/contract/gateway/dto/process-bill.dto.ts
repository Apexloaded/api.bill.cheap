import { Hex } from 'viem';

export class ProcessBillDto {
  amount: bigint;
  externalTxId: Hex;
  billId: Hex;
  providerId: Hex;
  tokenAddress: Hex;
  txType: number;
  billType: number;
}

export class AccountBalance {
  name: string;
  symbol: string;
  icon: string;
  balance: string;
  address: string;
  aggregator: string;
  usdValue?: string;
  fxRate?: {
    id: string;
    currentPrice: string;
    emaPrice: string;
    confidence: string;
    timestamp: Date;
  };
}
