import { IsEnum, IsObject, IsString } from 'class-validator';
import { BillType } from '../entities/bill.entity';

export class CreateBillDto {
  @IsString()
  amount: string;

  @IsString()
  amountId?: number;

  @IsObject()
  additionalInfo?: {
    invoiceId?: string;
  };

  @IsString()
  provider: string;

  @IsString()
  token: string;

  @IsString()
  providerName: string;

  @IsString()
  logoUrl?: string;

  @IsString()
  phoneNumber?: string;

  @IsString()
  accountNumber?: string;

  @IsString()
  isoCode: string;

  @IsString()
  userId: string;

  @IsEnum(BillType)
  billType: BillType;

  @IsString()
  currencySymbol: string;
}
