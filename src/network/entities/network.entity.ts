import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NetworkDocument = HydratedDocument<Network>;

export enum NetworkType {
  testnet = 'testnet',
  mainnet = 'mainnet',
}

@Schema({ timestamps: true })
export class Network {
  @Prop({ unique: true, required: true, index: true })
  chainId: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  shortName: string;

  @Prop()
  rpcUrl?: string;

  @Prop()
  rpcId?: string;

  @Prop()
  wssUrl?: string;

  @Prop()
  explorerUrl: string;

  @Prop({ default: true })
  isEnabled: boolean;

  @Prop({ enum: NetworkType, required: true })
  type: NetworkType;

  @Prop()
  icon: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NetworkSchema = SchemaFactory.createForClass(Network);
