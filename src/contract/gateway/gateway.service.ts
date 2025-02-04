import { Injectable } from '@nestjs/common';
import { ContractClient } from '../contract.client';
import processBillAbi from './abis/processBill.abi';
import { ConfigService } from '@nestjs/config';
import { ProcessBillDto } from './dto/process-bill.dto';
import { encodeFunctionData, parseEther } from 'viem';
import { EvmWalletProvider, ViemWalletProvider } from '@coinbase/agentkit';

@Injectable()
export class GatewayService {
  private gateway: `0x${string}`;

  constructor(
    private client: ContractClient,
    private config: ConfigService,
  ) {
    this.gateway = this.config.get<`0x${string}`>('bc.gateway');
  }

  async processBill(wallet: EvmWalletProvider, payload: ProcessBillDto) {
    const {
      amount,
      externalTxId,
      billId,
      providerId,
      tokenAddress,
      txType,
      billType,
    } = payload;
    const hash = await wallet.sendTransaction({
      to: this.gateway,
      data: encodeFunctionData({
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
      }),
      value: amount,
    });
    return await wallet.waitForTransactionReceipt(hash);
  }
}
