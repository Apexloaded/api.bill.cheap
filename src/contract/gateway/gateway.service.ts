import { Injectable } from '@nestjs/common';
import { ContractClient } from '../contract.client';
import gatewayAbi from './abis/gateway.abi';
import { ConfigService } from '@nestjs/config';
import { AccountBalance, ProcessBillDto } from './dto/process-bill.dto';
import {
  encodeFunctionData,
  erc20Abi,
  formatEther,
  Hex,
  parseEther,
  zeroAddress,
} from 'viem';
import { EvmWalletProvider, ViemWalletProvider } from '@coinbase/agentkit';
import { TokenDocument } from '@/network/token/entities/token.entity';
import { InitBill } from '@/bill/types/init-bill.type';
import { to0xString } from '@/utils/helpers';

@Injectable()
export class GatewayService {
  private gateway: `0x${string}`;

  constructor(
    private client: ContractClient,
    private config: ConfigService,
  ) {
    this.gateway = this.config.get<`0x${string}`>('bc.gateway');
  }

  get geteway(): string {
    return this.gateway;
  }

  async processBill(walletProvider: ViemWalletProvider, tx: InitBill) {
    const isNativeToken = tx.tokenAddress === zeroAddress;
    if (!isNativeToken) {
      const approvalHash = await walletProvider.sendTransaction({
        to: tx.tokenAddress as Hex,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [this.gateway as Hex, parseEther(`${tx.cryptoValue}`)],
        }),
      });
      await walletProvider.waitForTransactionReceipt(approvalHash);
    }

    const hash = await walletProvider.sendTransaction({
      to: this.gateway as Hex,
      data: encodeFunctionData({
        abi: gatewayAbi,
        functionName: 'processBill',
        args: [
          parseEther(`${tx.cryptoValue}`),
          to0xString(tx.transactionId),
          to0xString(tx.billId),
          to0xString(tx.providerId),
          to0xString(tx.tokenAddress),
          tx.transactionType,
          tx.billType,
        ],
      }),
      ...(isNativeToken && { value: parseEther(`${tx.cryptoValue}`) }),
    });
    await walletProvider.waitForTransactionReceipt(hash);
    return `Success Transaction ${hash}`;
  }

  getAccountBalance(
    tokens: TokenDocument[],
    address: `0x${string}`,
  ): Promise<AccountBalance[]> {
    return Promise.all(
      tokens.map(
        async ({ address: tokenAddress, name, symbol, icon, aggregator }) => {
          let balance: bigint;
          if (tokenAddress === zeroAddress) {
            balance = await this.client
              .getPublicClient()
              .getBalance({ address });
          } else {
            balance = await this.client.getPublicClient().readContract({
              address: tokenAddress as Hex,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address],
            });
          }
          return {
            name,
            symbol,
            icon,
            balance: formatEther(balance),
            address: tokenAddress,
            aggregator,
          };
        },
      ),
    );
  }
}
