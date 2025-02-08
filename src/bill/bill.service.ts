import { Injectable } from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Bill } from './entities/bill.entity';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class BillService {
  constructor(@InjectModel(Bill.name) private model: Model<Bill>) {}
  create(payload: Partial<Bill>) {
    return this.model.create(payload);
  }

  async findOne(filter: FilterQuery<Bill>) {
    return await this.model.findOne(filter);
  }

  async updateOne(filter: FilterQuery<Bill>, update: Partial<Bill>) {
    return await this.model.findOneAndUpdate(filter, update);
  }
}
