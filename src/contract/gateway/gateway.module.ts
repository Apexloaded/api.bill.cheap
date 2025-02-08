import { forwardRef, Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { ContractModule } from '../contract.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractEvent,
  ContractEventSchema,
} from '../schemas/contract-event.schema';
import { GatewayListener } from './gateway.listener';
import { BillModule } from '@/bill/bill.module';

@Module({
  imports: [
    forwardRef(() => ContractModule),
    MongooseModule.forFeature([
      { name: ContractEvent.name, schema: ContractEventSchema },
    ]),
    forwardRef(() => BillModule),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, GatewayListener],
  exports: [GatewayService],
})
export class GatewayModule {}
