import { Module } from '@nestjs/common';
import { BillService } from './bill.service';
import { BillController } from './bill.controller';
import { AirtimeModule } from './airtime/airtime.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Bill, BillSchema } from './entities/bill.entity';
import { BillProvider } from './bill.provider';
import { ReloadlyModule } from '@/reloadly/reloadly.module';
import { HttpModule } from '@nestjs/axios';
import { ExchangeModule } from '@/exchange/exchange.module';

@Module({
  imports: [
    AirtimeModule,
    MongooseModule.forFeature([{ name: Bill.name, schema: BillSchema }]),
    ReloadlyModule,
    HttpModule,
    ExchangeModule
  ],
  controllers: [BillController],
  providers: [BillService, BillProvider],
  exports: [BillProvider, BillService],
})
export class BillModule {}
