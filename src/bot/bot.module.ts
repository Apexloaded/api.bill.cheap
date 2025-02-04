import { Module } from '@nestjs/common';
import { BotReplies } from './bot.replies';
import { BotUpdate } from './bot.update';
import { AgentKitModule } from 'src/agent-kit/agent-kit.module';
import { UserModule } from '@/user/user.module';
import { WalletModule } from '@/wallet/wallet.module';
import { BotService } from './bot.service';

@Module({
  imports: [AgentKitModule, UserModule, WalletModule],
  providers: [BotUpdate, BotReplies, BotService],
  exports: [],
})
export class BotModule {}
