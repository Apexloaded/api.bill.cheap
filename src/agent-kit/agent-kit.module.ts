import { Module } from '@nestjs/common';
import { AgentKitService } from './agent-kit.service';
import { AgentKitController } from './agent-kit.controller';
import { AgentKitAction } from './agent-kit.action';
import { ContractModule } from 'src/contract/contract.module';
import { WalletModule } from '@/wallet/wallet.module';
import { UserModule } from '@/user/user.module';
import { ReloadlyModule } from '@/reloadly/reloadly.module';
import { BillModule } from '@/bill/bill.module';

@Module({
  imports: [ContractModule, WalletModule, BillModule],
  controllers: [AgentKitController],
  providers: [AgentKitService, AgentKitAction],
  exports: [AgentKitService, AgentKitAction],
})
export class AgentKitModule {}
