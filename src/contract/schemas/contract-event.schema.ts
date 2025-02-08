import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type ContractEventDocument = HydratedDocument<ContractEvent>;

@Schema({ timestamps: true })
export class ContractEvent {
  @Prop({ required: true, unique: true })
  transactionHash: string;

  @Prop({ required: true })
  blockNumber: number;

  @Prop({ required: true })
  eventName: string;

  @Prop({ type: Object, required: true })
  eventData: Record<string, any>;

  @Prop({ default: Date.now })
  processedAt: Date;
}

export const ContractEventSchema = SchemaFactory.createForClass(ContractEvent);
