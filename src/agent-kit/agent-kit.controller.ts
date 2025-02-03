import { Controller } from '@nestjs/common';
import { AgentKitService } from './agent-kit.service';

@Controller()
export class AgentKitController {
  constructor(private readonly agentKitService: AgentKitService) {}
}
