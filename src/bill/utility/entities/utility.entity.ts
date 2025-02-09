import { BillType } from '@/bill/entities/bill.entity';
import { Bill } from '@/bill/entities/bill.entity';
import { User } from '@/user/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export enum UtilityType {
  ELECTRICITY_BILL_PAYMENT = 'ELECTRICITY_BILL_PAYMENT',
  WATER_BILL_PAYMENT = 'WATER_BILL_PAYMENT',
  TV_BILL_PAYMENT = 'TV_BILL_PAYMENT',
  INTERNET_BILL_PAYMENT = 'INTERNET_BILL_PAYMENT',
}

export const getBillType = {
  [UtilityType.ELECTRICITY_BILL_PAYMENT]: BillType.ELECTRICITY,
  [UtilityType.WATER_BILL_PAYMENT]: BillType.WATER,
  [UtilityType.TV_BILL_PAYMENT]: BillType.CABLE_TV,
  [UtilityType.INTERNET_BILL_PAYMENT]: BillType.INTERNET,
};

export enum UtilityServiceType {
  PREPAID = 'PREPAID',
  POSTPAID = 'POSTPAID',
}

export type UtilityDocument = HydratedDocument<Utility>;

export class Recipient {
  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  accountNumber: string;
}

export class Provider {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  providerId: string;

  @Prop()
  logoUrl?: string;

  @Prop()
  transactionId?: string;
}

@Schema({ timestamps: true })
export class Utility {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
    unique: true,
  })
  bill: Bill;

  @Prop()
  provider: Provider;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  processedBy: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  processedFor?: User;

  @Prop()
  recipient: Recipient;

  @Prop({ required: true })
  amount: number;

  @Prop()
  amountId: number;

//   @Prop()
//   payload: object;

  @Prop()
  currency: string;

  @Prop({ required: true })
  reference: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UtilitySchema = SchemaFactory.createForClass(Utility);
