import { Injectable } from '@nestjs/common';
import { CreateAirtimeDto } from './dto/create-airtime.dto';
import { UpdateAirtimeDto } from './dto/update-airtime.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Airtime } from './entities/airtime.entity';
import { Model } from 'mongoose';

@Injectable()
export class AirtimeService {
  constructor(@InjectModel(Airtime.name) private model: Model<Airtime>) {}
  create(payload: Partial<Airtime>) {
    return this.model.create(payload);
  }

  findAll() {
    return `This action returns all airtime`;
  }

  findOne(id: number) {
    return `This action returns a #${id} airtime`;
  }

  update(id: number, updateAirtimeDto: UpdateAirtimeDto) {
    return `This action updates a #${id} airtime`;
  }

  remove(id: number) {
    return `This action removes a #${id} airtime`;
  }
}
