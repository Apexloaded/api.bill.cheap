import { BillStatus } from '@/bill/entities/bill.entity';
import { IsString } from 'class-validator';

export class CreateAirtimeDto {
  @IsString()
  amount: string;

  @IsString()
  provider: string;

  @IsString()
  address: string;

  @IsString()
  token: string;

  @IsString()
  usdValue: string;

  @IsString()
  providerName: string;

  @IsString()
  logoUrl: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  isoCode: string;
}

export class AirtimeBodyRequest {
  operatorId: string;
  amount: string;
  customIdentifier: string;
  recipientPhone: {
    countryCode: string;
    number: string;
  };
}

export class AirtimeStatusResponse {
  code: string | null;
  message: string | null;
  status: BillStatus;
  transaction: AirtimeBodyResponse;
}

export class AirtimeBodyResponse {
  transactionId: number;
  status: BillStatus;
  operatorTransactionId: string;
  customIdentifier: string;
  recipientPhone: number | null;
  recipientEmail: string | null;
  senderPhone: number;
  countryCode: string;
  operatorId: number;
  operatorName: string;
  discount: number;
  discountCurrencyCode: string;
  requestedAmount: number;
  requestedAmountCurrencyCode: string;
  deliveredAmount: number;
  deliveredAmountCurrencyCode: string;
  transactionDate: string; // Can be changed to Date if parsed
  fee: number;
  pinDetail: PinDetail;
  balanceInfo: BalanceInfo;
}

type PinDetail = {
  serial: number | null;
  info1: string;
  info2: string;
  info3: string;
  value: number | null;
  code: number;
  ivr: string;
  validity: string;
};

type BalanceInfo = {
  oldBalance: number;
  newBalance: number;
  currencyCode: string;
  currencyName: string;
  updatedAt: string; // Can be changed to Date if parsed
};
