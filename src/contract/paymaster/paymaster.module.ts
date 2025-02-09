import { forwardRef, Module } from '@nestjs/common';
import { PaymasterService } from './paymaster.service';
import { ContractModule } from '../contract.module';

@Module({
  imports: [forwardRef(() => ContractModule)],
  providers: [PaymasterService],
})
export class PaymasterModule {}
