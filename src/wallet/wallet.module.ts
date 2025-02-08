import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { UserModule } from '@/user/user.module';
import { NillionModule } from '@/nillion/nillion.module';

@Module({
  imports: [UserModule, NillionModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
