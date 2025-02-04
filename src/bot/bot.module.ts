import { Module } from '@nestjs/common';
import { BotReplies } from './bot.replies';
import { BotUpdate } from './bot.update';
import { AgentKitModule } from 'src/agent-kit/agent-kit.module';

@Module({
  imports: [AgentKitModule],
  providers: [BotUpdate, BotReplies],
  exports: [],
})
export class BotModule {}
