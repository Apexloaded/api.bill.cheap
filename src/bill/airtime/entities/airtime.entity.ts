import { Bill } from '@/bill/entities/bill.entity';
import { User } from '@/user/entities/user.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AirtimeDocument = HydratedDocument<Airtime>;

export class Recipient {
  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  number: string;
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
export class Airtime {
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
  localAmount: number;

  @Prop()
  foreignAmount: number;

  @Prop()
  currencyCode: string;

  @Prop({ required: true })
  reference: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AirtimeSchema = SchemaFactory.createForClass(Airtime);
