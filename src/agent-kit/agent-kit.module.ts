import { Module } from '@nestjs/common';
import { AgentKitService } from './agent-kit.service';
import { AgentKitController } from './agent-kit.controller';
import { AgentKitAction } from './agent-kit.action';

@Module({
  imports: [],
  controllers: [AgentKitController],
  providers: [AgentKitService, AgentKitAction],
  exports: [AgentKitService, AgentKitAction],
})
export class AgentKitModule {}
