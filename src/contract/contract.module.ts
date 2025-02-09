import { forwardRef, Module } from '@nestjs/common';
import { GatewayModule } from './gateway/gateway.module';
import { ContractClient } from './contract.client';
import { GatewayService } from './gateway/gateway.service';
import { PaymasterModule } from './paymaster/paymaster.module';

@Module({
  imports: [forwardRef(() => GatewayModule), forwardRef(() => PaymasterModule)],
  controllers: [],
  providers: [ContractClient, GatewayService],
  exports: [ContractClient, GatewayService],
})
export class ContractModule {}
