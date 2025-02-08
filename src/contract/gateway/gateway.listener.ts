import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ContractEvent } from '../schemas/contract-event.schema';
import { Model } from 'mongoose';
import { BlockchainEvent, GatewayService } from './gateway.service';
import { ContractEvents } from '@/enums/contract.enum';
import { BillProcessor } from '@/bill/bill.processor';

@Injectable()
export class GatewayListener implements OnModuleInit {
  private readonly logger = new Logger(GatewayListener.name);
  private lastProcessedBlock: number;
  private deployedAtBlock: number;
  private readonly MAX_BLOCK_RANGE = 50000;

  constructor(
    private readonly gateway: GatewayService,
    @InjectModel(ContractEvent.name)
    private readonly model: Model<ContractEvent>,
    private readonly billProcessor: BillProcessor
  ) {
    this.deployedAtBlock = 21587804;
  }

  async onModuleInit() {
    await this.initializeLastProcessedBlock();
  }

  async findContractEvents() {
    try {
      this.logger.log('Polling for new events...');
      const latestBlock = await this.gateway.getLatestBlockNumber();
      if (latestBlock <= this.lastProcessedBlock) {
        return;
      }

      let fromBlock = this.lastProcessedBlock + 1;
      let toBlock = Math.min(fromBlock + this.MAX_BLOCK_RANGE - 1, latestBlock);
      console.log(fromBlock, toBlock);

      while (fromBlock <= latestBlock) {
        this.logger.log(
          `Fetching events from block ${fromBlock} to ${toBlock}`,
        );
        const events = await this.gateway.getEvents(fromBlock, toBlock);

        for (const event of events) {
          this.logger.log('************Polling Event:************', event);
          await this.processEvent(event);
        }

        this.lastProcessedBlock = toBlock;
        this.logger.log(`Processed events up to block ${toBlock}`);

        fromBlock = toBlock + 1;
        toBlock = Math.min(fromBlock + this.MAX_BLOCK_RANGE - 1, latestBlock);
      }
    } catch (error) {
      this.logger.error('Error polling for events', error);
    }
  }

  private async initializeLastProcessedBlock() {
    const lastProcessedEvent = await this.model
      .findOne()
      .sort({ blockNumber: -1 })
      .exec();

    this.lastProcessedBlock = lastProcessedEvent
      ? lastProcessedEvent.blockNumber
      : this.deployedAtBlock;

    this.logger.log(
      `Initialized last processed block: ${this.lastProcessedBlock}`,
    );
  }

  private async processEvent(event: BlockchainEvent) {
    const existingEvent = await this.model
      .findOne({ transactionHash: event.transactionHash })
      .exec();

    if (existingEvent) {
      this.logger.log(
        `Event with txHash ${event.transactionHash} already processed, skipping`,
      );
      return;
    }

    switch (event.name) {
      case ContractEvents.BillProcessed:
        await this.billProcessor.processBillEvent(event);
        break;
      default:
        this.logger.warn(`Unhandled event type: ${event.name}`);
    }

    await this.model.create({
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      eventName: event.name,
      eventData: event.args,
    });
  }
}
