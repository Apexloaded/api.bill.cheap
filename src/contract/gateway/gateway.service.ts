import { Injectable, Logger } from '@nestjs/common';
import { ContractClient } from '../contract.client';
import gatewayAbi from './abis/gateway.abi';
import { ConfigService } from '@nestjs/config';
import { AccountBalance } from './dto/process-bill.dto';
import {
  encodeFunctionData,
  erc20Abi,
  formatEther,
  Hex,
  parseEther,
  zeroAddress,
} from 'viem';
import { ethers, Contract } from 'ethers';
import { ViemWalletProvider } from '@coinbase/agentkit';
import { TokenDocument } from '@/network/token/entities/token.entity';
import { InitBill } from '@/bill/types/init-bill.type';
import { to0xString } from '@/utils/helpers';
import { ContractEvents } from '@/enums/contract.enum';

export interface BlockchainEvent {
  name: string;
  args: any;
  blockNumber: number;
  transactionHash: string;
}
@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  private gateway: `0x${string}`;
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor(
    private client: ContractClient,
    private config: ConfigService,
  ) {
    this.gateway = this.config.get<`0x${string}`>('bc.gateway');
    const rpcUrl = this.config.get<string>('app.rpc');
    const adminKey = this.config.get<string>('app.adminWalletKey');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(adminKey, this.provider);
    this.contract = new Contract(this.gateway, gatewayAbi, this.signer);

    this.logger.log('*********BillCheap Service Initialized*********');
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

  async getLatestBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getEvents(
    fromBlock: number,
    toBlock: number,
  ): Promise<BlockchainEvent[]> {
    const eventNames = [ContractEvents.BillProcessed];
    const events: BlockchainEvent[] = [];

    for (const eventName of eventNames) {
      const filter = this.contract.filters[eventName]();
      const rawEvents = await this.contract.queryFilter(
        filter,
        fromBlock,
        toBlock,
      );
      events.push(
        ...rawEvents.map((event: any) => ({
          name: eventName,
          args: event.args,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        })),
      );
    }

    return events;
  }

}
