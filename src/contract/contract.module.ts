import { forwardRef, Module } from '@nestjs/common';
import { BillcheapModule } from './billcheap/billcheap.module';
import { ContractClient } from './contract.client';

@Module({
  imports: [forwardRef(() => BillcheapModule)],
  controllers: [],
  providers: [ContractClient],
  exports: [ContractClient],
})
export class ContractModule {}
