import { Module } from '@nestjs/common';
import { NillionService } from './nillion.service';
import { HttpModule } from '@nestjs/axios';
import { NillionApi } from './nillion.api';
import { MongooseModule } from '@nestjs/mongoose';
import { Nillion, NillionSchema } from './entities/nillion.entity';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Nillion.name, schema: NillionSchema }]),
  ],
  controllers: [],
  providers: [NillionService, NillionApi],
  exports: [NillionService, NillionApi],
})
export class NillionModule {}
