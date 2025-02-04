import { Injectable } from '@nestjs/common';
import { ContractClient } from '../contract.client';
import processBillAbi from './abis/processBill.abi';
import { ConfigService } from '@nestjs/config';
import { ProcessBillDto } from './dto/process-bill.dto';

@Injectable()
export class BillcheapService {
  private gateway: `0x${string}`;

  constructor(
    private client: ContractClient,
    private config: ConfigService,
  ) {
    this.gateway = this.config.get<`0x${string}`>('bc.gateway');
  }

  async processBill(account: any, payload: ProcessBillDto) {
    const {
      amount,
      externalTxId,
      billId,
      providerId,
      tokenAddress,
      txType,
      billType,
    } = payload;

    const client = this.client.getWalletClient(account);
    const { request } = await client.simulateContract({
      address: this.gateway,
      abi: processBillAbi,
      functionName: 'processBill',
      args: [
        amount,
        externalTxId,
        billId,
        providerId,
        tokenAddress,
        txType,
        billType,
      ],
    });
    await client.writeContract(request);
  }
}
