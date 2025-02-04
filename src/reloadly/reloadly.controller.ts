import { Controller } from '@nestjs/common';
import { ReloadlyService } from './reloadly.service';

@Controller()
export class ReloadlyController {
  constructor(private readonly reloadlyService: ReloadlyService) {}
}
