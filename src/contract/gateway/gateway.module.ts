import { forwardRef, Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayController } from './gateway.controller';
import { ContractModule } from '../contract.module';

@Module({
  imports: [forwardRef(() => ContractModule)],
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
