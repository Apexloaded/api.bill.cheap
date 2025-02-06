import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Network } from '../../entities/network.entity';

export type TokenDocument = HydratedDocument<Token>;

@Schema({ timestamps: true })
export class Token {
  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Network',
    required: true,
  })
  chainId: Network[];

  @Prop({ unique: true, lowercase: true })
  address: string;

  @Prop({ lowercase: true })
  aggregator: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop()
  icon: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
