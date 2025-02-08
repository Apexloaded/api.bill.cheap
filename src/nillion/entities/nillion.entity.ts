import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NillionDocument = HydratedDocument<Nillion>;

export enum Tables {
  wallet = 'wallet',
}

@Schema({ timestamps: true })
export class Nillion {
  @Prop({ unique: true, required: true, index: true })
  schemaId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: Tables })
  table: Tables;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NillionSchema = SchemaFactory.createForClass(Nillion);
