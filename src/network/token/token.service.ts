import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Token } from './entities/token.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class TokenService {
  constructor(@InjectModel(Token.name) private model: Model<Token>) {}
  create(createTokenDto: CreateTokenDto) {
    return this.model.create(createTokenDto);
  }

  batchCreate(createTokenDto: CreateTokenDto[]) {
    return this.model.insertMany(createTokenDto);
  }
}
