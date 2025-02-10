import { Module } from '@nestjs/common';
import { BotReplies } from './bot.replies';
import { BotUpdate } from './bot.update';
import { AgentKitModule } from 'src/agent-kit/agent-kit.module';
import { UserModule } from '@/user/user.module';
import { WalletModule } from '@/wallet/wallet.module';
import { BotService } from './bot.service';
import { NillionModule } from '@/nillion/nillion.module';
import { BotCommand } from './bot.command';
import { BillModule } from '@/bill/bill.module';

@Module({
  imports: [
    AgentKitModule,
    UserModule,
    WalletModule,
    NillionModule,
    BillModule,
  ],
  providers: [BotUpdate, BotCommand, BotReplies, BotService],
  exports: [],
})
export class BotModule {}
