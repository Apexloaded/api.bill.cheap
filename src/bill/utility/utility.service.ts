import { Injectable } from '@nestjs/common';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Utility } from './entities/utility.entity';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class UtilityService {
  constructor(@InjectModel(Utility.name) private model: Model<Utility>) {}
  create(payload: Partial<Utility>) {
    return this.model.create(payload);
  }

  findAll() {
    return `This action returns all utility`;
  }

  findOne(filter: FilterQuery<Utility>) {
    return this.model.findOne(filter);
  }

  update(id: number, updateUtilityDto: UpdateUtilityDto) {
    return `This action updates a #${id} utility`;
  }

  remove(id: number) {
    return `This action removes a #${id} utility`;
  }
}
