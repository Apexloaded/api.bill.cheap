import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsString } from 'class-validator';
import { CreateTopUpDto } from '../topup/dto/create-topup.dto';
import { BillType } from '../entities/bill.entity';

export class CreateBillDto extends PartialType(CreateTopUpDto) {
  @IsString()
  userId: string;

  @IsEnum(BillType)
  billType: BillType;

  @IsString()
  currencySymbol: string;
}

