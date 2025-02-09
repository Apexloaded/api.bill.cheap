import { Module } from '@nestjs/common';
import { AgentKitService } from './agent-kit.service';
import { AgentKitController } from './agent-kit.controller';
import { WalletModule } from '@/wallet/wallet.module';
import { BillModule } from '@/bill/bill.module';
import { GatewayModule } from '@/contract/gateway/gateway.module';
import { UtilityModule } from '@/bill/utility/utility.module';
import { TopUpModule } from '@/bill/topup/topup.module';

@Module({
  imports: [
    WalletModule,
    BillModule,
    GatewayModule,
    TopUpModule,
    UtilityModule,
  ],
  controllers: [AgentKitController],
  providers: [AgentKitService],
  exports: [AgentKitService],
})
export class AgentKitModule {}
