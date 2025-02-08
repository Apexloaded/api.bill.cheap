import { Injectable } from '@nestjs/common';
import { CreateTopUpDto } from './dto/create-topup.dto';
import { UpdateTopUpDto } from './dto/update-topup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { TopUp } from './entities/topup.entity';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class TopUpService {
  constructor(@InjectModel(TopUp.name) private model: Model<TopUp>) {}
  create(payload: Partial<TopUp>) {
    return this.model.create(payload);
  }

  findAll(filter: FilterQuery<TopUp>) {
    return this.model.find(filter);
  }

  findOne(filter: FilterQuery<TopUp>) {
    return this.model.findOne(filter);
  }

  update(id: number, updateAirtimeDto: UpdateTopUpDto) {
    return `This action updates a #${id} airtime`;
  }

  remove(id: number) {
    return `This action removes a #${id} airtime`;
  }
}
