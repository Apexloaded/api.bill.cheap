import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AirtimeService } from './airtime.service';
import { CreateAirtimeDto } from './dto/create-airtime.dto';
import { UpdateAirtimeDto } from './dto/update-airtime.dto';

@Controller('airtime')
export class AirtimeController {
  constructor(private readonly airtimeService: AirtimeService) {}

  @Post()
  create(@Body() createAirtimeDto: CreateAirtimeDto) {
    // return this.airtimeService.create(createAirtimeDto);
  }

  @Get()
  findAll() {
    return this.airtimeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.airtimeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAirtimeDto: UpdateAirtimeDto) {
    return this.airtimeService.update(+id, updateAirtimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airtimeService.remove(+id);
  }
}
