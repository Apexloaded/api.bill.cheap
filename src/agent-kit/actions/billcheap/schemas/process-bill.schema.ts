import { BillType } from '@/bill/entities/bill.entity';
import { z } from 'zod';

export enum Mode {
  GET = 'GET',
  POST = 'POST',
}
export const TopUpBillSchema = z.object({
  amount: z.string().describe('The amount to pay'),
  billType: z.enum([BillType.AIRTIME, BillType.MOBILE_DATA]),
  phoneNumber: z.string().describe('The phone number of the recipient'),
  callingCode: z.string().describe('The country calling code'),
  isoCode: z.string().describe('The ISO code of the recipient'),
  tokenAddress: z.string().describe('The contract address of the token'),
  providerName: z.string().describe('The name of the provider'),
  providerId: z.number().describe('The service providers id'),
  providerLogoUrl: z.string().describe('The logo url of the provider'),
  isLocal: z.boolean(),
  pin: z.boolean().default(true),
  isForeignTx: z.boolean(),
  mode: z.enum([Mode.GET, Mode.POST]),
});
