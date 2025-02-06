import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NetworkService } from './network.service';
import { CreateNetworkDto } from './dto/create-network.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';

@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Post('add')
  create(@Body() createNetworkDto: CreateNetworkDto) {
    return this.networkService.create(createNetworkDto);
  }

  @Post('batch/add')
  batchCreate(@Body() batchNetworkDto: CreateNetworkDto[]) {
    return this.networkService.batchCreate(batchNetworkDto);
  }
}
