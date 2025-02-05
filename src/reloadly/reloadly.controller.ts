import { Controller, Get } from '@nestjs/common';
import { ReloadlyService } from './reloadly.service';

@Controller('reloadly')
export class ReloadlyController {
  constructor(private readonly reloadlyService: ReloadlyService) {}

  @Get('/account/balance')
  getBalance() {
    try {
      return this.reloadlyService.accountBalance();
    } catch (error) {
      return error;
    }
  }
}
