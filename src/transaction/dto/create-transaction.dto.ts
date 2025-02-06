import { IsEnum, IsNumber, IsString } from 'class-validator';
import { PaymentMethods, TxType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsString()
  userId: string;

  @IsString()
  billId?: string;

  @IsNumber()
  amount: number;

  @IsEnum(TxType)
  type: TxType;

  @IsEnum(PaymentMethods)
  paymentMethod: PaymentMethods;

  @IsString()
  tokenAddress?: string;
}
