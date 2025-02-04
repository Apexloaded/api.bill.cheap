import { Hex } from "viem";

export class ProcessBillDto {
  amount: bigint;
  externalTxId: Hex;
  billId: Hex;
  providerId: Hex;
  tokenAddress: Hex;
  txType: number;
  billType: number;
}
