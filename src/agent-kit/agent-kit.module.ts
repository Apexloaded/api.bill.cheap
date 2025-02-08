import { Module } from '@nestjs/common';
import { AgentKitService } from './agent-kit.service';
import { AgentKitController } from './agent-kit.controller';
import { WalletModule } from '@/wallet/wallet.module';
import { BillModule } from '@/bill/bill.module';
import { GatewayModule } from '@/contract/gateway/gateway.module';

@Module({
  imports: [WalletModule, BillModule, GatewayModule],
  controllers: [AgentKitController],
  providers: [AgentKitService],
  exports: [AgentKitService],
})
export class AgentKitModule {}
