import { Controller } from '@nestjs/common';
import { ExchangeService } from './exchange.service';

@Controller()
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}
}
