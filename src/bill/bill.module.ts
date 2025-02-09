import { forwardRef, Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { TopUpModule } from './topup/topup.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Bill, BillSchema } from './entities/bill.entity';
import { BillProvider } from './bill.provider';
import { ReloadlyModule } from '@/reloadly/reloadly.module';
import { HttpModule } from '@nestjs/axios';
import { ExchangeModule } from '@/exchange/exchange.module';
import { TransactionModule } from '@/transaction/transaction.module';
import { TokenModule } from '@/network/token/token.module';
import { BillProcessor } from './bill.processor';
import { UtilityModule } from './utility/utility.module';

@Module({
  imports: [
    forwardRef(() => TopUpModule),
    MongooseModule.forFeature([{ name: Bill.name, schema: BillSchema }]),
    ReloadlyModule,
    HttpModule,
    ExchangeModule,
    TransactionModule,
    TokenModule,
    UtilityModule
  ],
  controllers: [BillController],
  providers: [BillService, BillProvider, BillProcessor],
  exports: [BillProvider, BillService, BillProcessor],
})
export class BillModule {}
