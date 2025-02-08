import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Role } from '@/enums/roles.enum';
import { Exclude, Transform } from 'class-transformer';
import { generateId } from '@/utils/helpers';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop({ index: true })
  telegramId?: number;

  @Prop({ lowercase: true })
  billName: string;

  @Prop({
    unique: true,
    index: true,
  })
  billId: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  phone: string;

  @Prop({ lowercase: true })
  email: string;

  @Prop({ select: false })
  @Exclude()
  pin: string;

  @Prop({ select: false })
  @Exclude()
  password: string;

  @Prop({ lowercase: true })
  wallet: string;

  @Prop()
  referrerBy: string;

  @Prop({ index: true })
  referralCode: string;

  @Prop({ default: Role.USER })
  roles: [Role];

  @Prop()
  address1: string;

  @Prop()
  address2: string;

  @Prop()
  country: string;

  @Prop()
  countryCode: string;

  @Prop()
  isoCode: string;

  @Prop()
  defaultCurrency: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', function (next) {
  if (!this.referralCode) {
    // Generate a random, unique 8-character referral code
    this.referralCode = generateId({ dictionary: 'hex', length: 9 });
  }
  if (!this.billId) {
    this.billId = generateId({ dictionary: 'number', length: 8 });
  }
  next();
});