import { Injectable } from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Bill } from './entities/bill.entity';
import { Model } from 'mongoose';

@Injectable()
export class BillService {
  constructor(@InjectModel(Bill.name) private model: Model<Bill>) {}
  create(payload: Partial<Bill>) {
    return this.model.create(payload);;
  }

  findAll() {
    return `This action returns all bill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bill`;
  }

  update(id: number, updateBillDto: UpdateBillDto) {
    return `This action updates a #${id} bill`;
  }

  remove(id: number) {
    return `This action removes a #${id} bill`;
  }
}
