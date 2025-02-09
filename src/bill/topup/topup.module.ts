import { forwardRef, Module } from '@nestjs/common';
import { TopUpService } from './topup.service';
import { TopUpController } from './topup.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TopUp, TopUpSchema } from './entities/topup.entity';
import { ReloadlyModule } from '@/reloadly/reloadly.module';
import { HttpModule } from '@nestjs/axios';
import { TopUpProvider } from './topup.provider';
import { TransactionModule } from '@/transaction/transaction.module';
import { TokenModule } from '@/network/token/token.module';
import { ExchangeModule } from '@/exchange/exchange.module';
import { BillModule } from '../bill.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TopUp.name, schema: TopUpSchema }]),
    ReloadlyModule,
    HttpModule,
    TransactionModule,
    TokenModule,
    ExchangeModule,
    forwardRef(() => BillModule),
  ],
  controllers: [TopUpController],
  providers: [TopUpService, TopUpProvider],
  exports: [TopUpService, TopUpProvider],
})
export class TopUpModule {}
