import { Module } from '@nestjs/common';
import { TopUpService } from './topup.service';
import { TopUpController } from './topup.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TopUp, TopUpSchema } from './entities/topup.entity';
import { ReloadlyModule } from '@/reloadly/reloadly.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TopUp.name, schema: TopUpSchema }]),
    ReloadlyModule,
    HttpModule,
  ],
  controllers: [TopUpController],
  providers: [TopUpService],
  exports: [TopUpService],
})
export class TopUpModule {}
