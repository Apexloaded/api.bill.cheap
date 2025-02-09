import { BillStatus, BillType } from '@/bill/entities/bill.entity';
import { IsEnum, IsString } from 'class-validator';

export class CreateUtilityDto {}

export class UtilityBodyRequest {
  amount: number;
  amountId: number;
  billerId: string;
  referenceId: string;
  customIdentifier: string;
  subscriberAccountNumber: string;
  useLocalAmount?: boolean;
}

export class UtilityBodyResponse {
  id: number;
  status: BillStatus;
  referenceId: string;
  code: 'PAYMENT_PROCESSING_IN_PROGRESS';
  message: string;
  submittedAt: string;
  finalStatusAvailabilityAt: string;
}

export class UtilityStatusResponse {}
