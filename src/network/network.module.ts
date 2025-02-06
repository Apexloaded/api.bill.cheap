import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkController } from './network.controller';
import { TokenModule } from './token/token.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Network, NetworkSchema } from './entities/network.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Network.name, schema: NetworkSchema }]),
    TokenModule,
  ],
  controllers: [NetworkController],
  providers: [NetworkService],
})
export class NetworkModule {}
