export class ProcessBillDto {
  amount: bigint;
  externalTxId: `0x${string}`;
  billId: `0x${string}`;
  providerId: `0x${string}`;
  tokenAddress: `0x${string}`;
  txType: number;
  billType: number;
}
