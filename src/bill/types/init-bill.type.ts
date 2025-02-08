import { ContractBillType, ContractTxType } from '@/enums/contract.enum';
import { Hex } from 'viem';

export type InitBill = {
  transactionId: Hex;
  billType: ContractBillType;
  billId: Hex;
  tokenAddress: string;
  transactionType: ContractTxType;
  providerId: Hex;
  cryptoValue: number;
};
