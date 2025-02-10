import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  findAll(filter?: FilterQuery<User>) {
    return this.userModel.find(filter);
  }
  findOne(
    filter: FilterQuery<User>,
    select?:
      | string
      | string[]
      | Record<string, number | boolean | string | object>,
  ) {
    return this.userModel.findOne(filter).select(select);
  }

  findOneOrCreate(
    filter: FilterQuery<User>,
    createUserDto: Partial<User>,
  ): Promise<User> {
    return this.userModel.findOneAndUpdate(
      filter,
      { $setOnInsert: createUserDto },
      { upsert: true, new: true },
    );
  }

  update(filter: FilterQuery<User>, payload: Partial<User>) {
    return this.userModel.findOneAndUpdate(filter, payload);
  }
}
