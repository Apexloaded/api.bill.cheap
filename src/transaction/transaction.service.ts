import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction } from './entities/transaction.entity';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private model: Model<Transaction>,
  ) {}
  create(createTransactionDto: CreateTransactionDto) {
    return this.model.create(createTransactionDto);
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(filter: FilterQuery<Transaction>) {
    return this.model.findOne(filter);
  }

  update(filter: FilterQuery<Transaction>, update: Partial<Transaction>) {
    return this.model.findOneAndUpdate(filter, update);
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
