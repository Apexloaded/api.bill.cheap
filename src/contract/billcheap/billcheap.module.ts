import { forwardRef, Module } from '@nestjs/common';
import { BillcheapService } from './billcheap.service';
import { BillcheapController } from './billcheap.controller';
import { ContractModule } from '../contract.module';

@Module({
  imports: [forwardRef(() => ContractModule)],
  controllers: [BillcheapController],
  providers: [BillcheapService],
})
export class BillcheapModule {}
