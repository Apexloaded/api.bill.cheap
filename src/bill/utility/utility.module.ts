import { Module } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { UtilityController } from './utility.controller';
import { UtilityProvider } from './utility.provider';
import { ReloadlyModule } from '@/reloadly/reloadly.module';
import { TransactionModule } from '@/transaction/transaction.module';
import { TokenModule } from '@/network/token/token.module';
import { ExchangeModule } from '@/exchange/exchange.module';
import { Utility, UtilitySchema } from './entities/utility.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ReloadlyModule,
    TransactionModule,
    TokenModule,
    ExchangeModule,
    MongooseModule.forFeature([{ name: Utility.name, schema: UtilitySchema }]),
  ],
  controllers: [UtilityController],
  providers: [UtilityService, UtilityProvider],
  exports: [UtilityService, UtilityProvider],
})
export class UtilityModule {}
