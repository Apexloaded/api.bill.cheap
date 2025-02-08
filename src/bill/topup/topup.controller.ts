import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TopUpService } from './topup.service';
import { CreateTopUpDto } from './dto/create-topup.dto';
import { UpdateTopUpDto } from './dto/update-topup.dto';

@Controller('topup')
export class TopUpController {
  constructor(private readonly topUpService: TopUpService) {}

  @Post()
  create(@Body() createTopUpDto: CreateTopUpDto) {
    // return this.topUpService.create(createTopUpDto);
  }

  @Get()
  findAll() {
    // return this.topUpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    //return this.topUpService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTopUpDto: UpdateTopUpDto) {
    return this.topUpService.update(+id, updateTopUpDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.topUpService.remove(+id);
  }
}
