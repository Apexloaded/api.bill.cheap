import { Module } from '@nestjs/common';
import { AirtimeService } from './airtime.service';
import { AirtimeController } from './airtime.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Airtime, AirtimeSchema } from './entities/airtime.entity';
import { ReloadlyModule } from '@/reloadly/reloadly.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Airtime.name, schema: AirtimeSchema },
    ]),
    ReloadlyModule,
    HttpModule,
  ],
  controllers: [AirtimeController],
  providers: [AirtimeService],
  exports: [AirtimeService],
})
export class AirtimeModule {}
