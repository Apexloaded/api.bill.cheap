import { forwardRef, Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { ContractModule } from '../contract.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractEvent, ContractEventSchema } from '../schemas/contract-event.schema';

@Module({
  imports: [
    forwardRef(() => ContractModule),
    MongooseModule.forFeature([
      { name: ContractEvent.name, schema: ContractEventSchema },
    ]),
  ],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
