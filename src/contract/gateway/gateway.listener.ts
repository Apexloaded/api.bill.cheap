import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ContractEvent } from '../schemas/contract-event.schema';
import { Model } from 'mongoose';
import { GatewayService } from './gateway.service';

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
}
