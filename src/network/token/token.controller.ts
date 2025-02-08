import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('add')
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.tokenService.create(createTokenDto);
  }

  @Post('batch/add')
  batchCreate(@Body() createTokenDto: CreateTokenDto[]) {
    return this.tokenService.batchCreate(createTokenDto);
  }

  @Get('prices')
  getPrices() {
    return this.tokenService.queryBalance(
      '0x8494DCC7B4059Af6653b3BC2Ba66E0238E4Aca57',
    );
  }
}
