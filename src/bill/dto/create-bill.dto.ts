import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsString } from 'class-validator';
import { CreateAirtimeDto } from '../airtime/dto/create-airtime.dto';
import { BillType } from '../entities/bill.entity';

export class CreateBillDto extends PartialType(CreateAirtimeDto) {
  @IsString()
  userId: string;

  @IsEnum(BillType)
  billType: BillType;

  @IsString()
  currencySymbol: string;
}
