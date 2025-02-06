import { Injectable } from '@nestjs/common';
import { CreateNetworkDto } from './dto/create-network.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Network } from './entities/network.entity';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class NetworkService {
  constructor(@InjectModel(Network.name) private model: Model<Network>) {}
  create(createNetworkDto: CreateNetworkDto) {
    return this.model.create(createNetworkDto);
  }

  batchCreate(createNetworkDto: CreateNetworkDto[]) {
    return this.model.insertMany(createNetworkDto);
  }

  findAll(filter?: FilterQuery<Network>) {
    return this.model.find(filter);
  }

  findOne(filter: FilterQuery<Network>) {
    return this.model.findOne(filter);
  }

  update(filter: FilterQuery<Network>, updateNetworkDto: UpdateNetworkDto) {
    return this.model.findOneAndUpdate(filter, updateNetworkDto);
  }

  remove(filter: FilterQuery<Network>) {
    return this.model.findOneAndDelete(filter);
  }
}
