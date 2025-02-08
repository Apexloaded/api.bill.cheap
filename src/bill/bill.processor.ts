import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BillStatus, BillType } from './entities/bill.entity';
import { BlockchainEvent } from '@/contract/gateway/gateway.service';
import { fromHex } from 'viem';
import { BillService } from './bill.service';
import { TransactionService } from '@/transaction/transaction.service';
import { TxStatus } from '@/transaction/entities/transaction.entity';
import { TopUpProcessor } from './topup/topup.processor';

@Injectable()
export class BillProcessor {
  private readonly logger = new Logger(BillProcessor.name);

  constructor(
    private readonly billService: BillService,
    private readonly topUpProcessor: TopUpProcessor,
    private readonly txService: TransactionService,
  ) {}

  async processBillEvent(event: BlockchainEvent) {
    const { from, id, externalTxId, billId, timestamp } = event.args;
    const unHashedBillId = fromHex(billId, 'string');
    const unHashedTransactionId = fromHex(externalTxId, 'string');

    const bill = await this.billService.findOne({ _id: unHashedBillId });
    const transaction = this.txService.findOne({ _id: unHashedTransactionId });

    if (!bill || !transaction) return;

    switch (bill.billType) {
      case BillType.AIRTIME: {
        try {
          const airtimeRes = await this.topUpProcessor.processTopUp(
            unHashedBillId,
            bill.useLocalAmount,
          );

          const [billsUpdate, txUpdate] = await Promise.all([
            this.billService.updateOne(
              { _id: unHashedBillId },
              {
                status: airtimeRes.status,
                billExternalId: airtimeRes.transaction.transactionId,
              },
            ),
            this.txService.update(
              { _id: unHashedTransactionId },
              {
                hash: event.transactionHash,
                status: TxStatus.SUCCESSFUL,
                onChainTxId: id,
                senderAddress: from,
              },
            ),
          ]);
        } catch (error) {
          this.logger.error('Error processing airtime bill', error);
        }
        break;
      }
      case BillType.MOBILE_DATA: {
        try {
          const airtimeRes = await this.topUpProcessor.processTopUp(
            unHashedBillId,
            bill.useLocalAmount,
          );

          const [billsUpdate, txUpdate] = await Promise.all([
            this.billService.updateOne(
              { _id: unHashedBillId },
              {
                status: airtimeRes.status,
                billExternalId: airtimeRes.transaction.transactionId,
              },
            ),
            this.txService.update(
              { _id: unHashedTransactionId },
              {
                hash: event.transactionHash,
                status: TxStatus.SUCCESSFUL,
                onChainTxId: id,
                senderAddress: from,
              },
            ),
          ]);
        } catch (error) {
          this.logger.error('Error processing airtime bill', error);
        }
        break;
      }
      default:
        this.logger.warn(`Unhandled event type: ${event.name}`);
    }
  }
}
