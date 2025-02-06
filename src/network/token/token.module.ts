import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { ContractModule } from '@/contract/contract.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './entities/token.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
    ]),
    ContractModule,
  ],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
