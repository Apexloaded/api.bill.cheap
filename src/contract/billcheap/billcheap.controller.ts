import { Controller } from '@nestjs/common';
import { BillcheapService } from './billcheap.service';

@Controller()
export class BillcheapController {
  constructor(private readonly billcheapService: BillcheapService) {}
}
