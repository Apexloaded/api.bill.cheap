import {
  UtilityServiceType,
  UtilityType,
} from '@/bill/utility/entities/utility.entity';
import { z } from 'zod';

export const FindUtilitySchema = z.object({
  name: z.string().optional().describe('The name of the utility provider'),
  type: z.string().optional().describe('The type of utility bill '),
  serviceType: z.string().optional(),
  countryISOCode: z
    .string()
    .optional()
    .describe('The ISO Code of where the provider is located'),
  isLocal: z.boolean().optional(),
  isForeignTx: z.boolean().optional(),
});

export const ProcessUtilitySchema = z.object({
  id: z.number().describe('The id of the utility provider'),
  name: z.string().describe('The name of the utility provider'),
  amount: z.string().describe('The amount to pay'),
  amountId: z.string().describe('The amount id for fixed utility provider'),
  tokenAddress: z
    .string()
    .describe('The contract address of the token you will pay with'),
  accountNumber: z
    .string()
    .describe(
      'This indicates the account, reference, or card number of the subscriber or recipient of the bill payment',
    ),
  type: z.enum([
    UtilityType.ELECTRICITY_BILL_PAYMENT,
    UtilityType.INTERNET_BILL_PAYMENT,
    UtilityType.TV_BILL_PAYMENT,
    UtilityType.WATER_BILL_PAYMENT,
  ]),
  serviceType: z.enum([
    UtilityServiceType.PREPAID,
    UtilityServiceType.POSTPAID,
  ]),
  countryISOCode: z
    .string()
    .describe('The ISO Code of where the provider is located'),
  isLocal: z.boolean(),
  isForeignTx: z.boolean(),
});
