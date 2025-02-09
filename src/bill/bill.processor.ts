import { Injectable, Logger } from '@nestjs/common';
import { BillStatus, BillType } from './entities/bill.entity';
import { BlockchainEvent } from '@/contract/gateway/gateway.service';
import { fromHex } from 'viem';
import { BillService } from './bill.service';
import { TransactionService } from '@/transaction/transaction.service';
import { TxStatus } from '@/transaction/entities/transaction.entity';
import { TopUpProvider } from './topup/topup.provider';
import { UtilityProvider } from './utility/utility.provider';

@Injectable()
export class BillProcessor {
  private readonly logger = new Logger(BillProcessor.name);

  constructor(
    private readonly billService: BillService,
    private readonly topUpProvider: TopUpProvider,
    private readonly utilityProvider: UtilityProvider,
    private readonly txService: TransactionService,
  ) {}

  async processBillEvent(event: BlockchainEvent) {
    const { from, id, externalTxId, billId, timestamp } = event.args;
    const unHashedBillId = fromHex(billId, 'string');
    const unHashedTransactionId = fromHex(externalTxId, 'string');

    const bill = await this.billService.findOne({ _id: unHashedBillId });
    const transaction = this.txService.findOne({ _id: unHashedTransactionId });

    if (!bill || !transaction) return;

    let status: BillStatus;
    let transactionId: number;

    if ([BillType.AIRTIME, BillType.MOBILE_DATA].includes(bill.billType)) {
      try {
        const topupResponse = await this.topUpProvider.processTopUp(
          unHashedBillId,
          bill.useLocalAmount,
        );
        status = topupResponse.status;
        transactionId = topupResponse.transaction.transactionId;
      } catch (error) {
        this.logger.error('Error processing topup bill', error);
      }
    }

    if (
      [
        BillType.CABLE_TV,
        BillType.ELECTRICITY,
        BillType.INTERNET,
        BillType.WATER,
      ].includes(bill.billType)
    ) {
      try {
        const { body, status: txStatus } =
          await this.utilityProvider.processTopUp(
            unHashedBillId,
            bill.useLocalAmount,
          );
        status = body.status;
        transactionId = body.id;
      } catch (error) {
        this.logger.error('Error processing utility bill', error);
      }
    }

    await this.updateTransaction(
      unHashedBillId,
      status,
      transactionId,
      unHashedTransactionId,
      TxStatus.SUCCESSFUL,
      id,
      from,
    );
  }

  async updateTransaction(
    billId: string,
    status: BillStatus,
    billExternalId: number,
    txId: string,
    txHash: string,
    onChainId: string,
    from: string,
  ) {
    const [billsUpdate, txUpdate] = await Promise.all([
      this.billService.updateOne(
        { _id: billId },
        {
          status: status,
          billExternalId,
        },
      ),
      this.txService.update(
        { _id: txId },
        {
          hash: txHash,
          status: TxStatus.SUCCESSFUL,
          onChainTxId: onChainId,
          senderAddress: from,
        },
      ),
    ]);
  }
}
