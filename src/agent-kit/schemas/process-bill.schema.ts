import { z } from 'zod';

export const ProcessTopupSchema = z.object({
  amount: z.string().describe('The amount to pay'),
  billType: z.enum(['AIRTIME', 'MOBILE_DATA']),
  phoneNumber: z.string().describe('The phone number of the recipient'),
  callingCode: z.string().describe('The country calling code'),
  isoCode: z.string().describe('The ISO code of the recipient'),
  tokenAddress: z.string().describe('The contract address of the token'),
  provider: z.string().describe('The service providers name'),
  isLocal: z.boolean().default(true),
});
