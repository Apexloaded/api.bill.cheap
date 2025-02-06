import { Bill } from '@/bill/entities/bill.entity';
import { User } from '@/user/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, now } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export enum TxStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum TxType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  INTER_WALLET = 'INTER-WALLET',
  LOAN = 'LOAN',
  PURCHASE = 'PURCHASE',
  REFILL = 'REFILL',
  TRANSFER = 'TRANSFER',
  REDEEM = 'REDEEM',
  CHARGEBACK = 'CHARGEBACK',
  BILL_PAYMENT = 'BILL_PAYMENT',
}

export enum PaymentMethods {
  CRYPTO = 'CRYPTO',
}

class MetaData {
  [key: string]: any;
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop()
  hash: string; // To be updated when event is emitted from blockchain

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: false })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Bill', unique: false })
  billId: Bill;

  @Prop({ min: 0, required: true })
  amount: number; // Amount in NGN

  @Prop()
  currency: string; // The currency of the destination amount

  @Prop({ required: true })
  amountInUsd: number;

  @Prop() // To be updated when event is emitted from blockchain
  amountInWei: number;

  @Prop()
  onChainTxId: string; // To be updated when event is emitted from blockchain

  @Prop()
  senderAddress: string; // To be updated when event is emitted from blockchain

  @Prop()
  recipientAddress: string; // To be updated when event is emitted from blockchain

  @Prop({ type: String, enum: TxType, required: true })
  type: TxType;

  @Prop({ enum: TxStatus, required: true, default: TxStatus.PENDING })
  status: TxStatus;

  @Prop({ enum: PaymentMethods, required: true })
  paymentMethod: PaymentMethods;

  @Prop()
  tokenAddress: string;

  @Prop({ type: Object })
  metaData: MetaData;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  constructor() {}
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
