import { UtilityServiceType, UtilityType } from '../entities/utility.entity';

export type UtitliyOperators = {
  id: number;
  name: string;
  countryCode: string;
  countryName: string;
  type: UtilityType;
  serviceType: UtilityServiceType;
  localAmountSupported: boolean;
  localTransactionCurrencyCode: string;
  minLocalTransactionAmount: number;
  maxLocalTransactionAmount: number;
  localTransactionFee: number;
  localTransactionFeeCurrencyCode: string;
  localDiscountPercentage: number;
  internationalAmountSupported: boolean;
  internationalTransactionCurrencyCode: string;
  minInternationalTransactionAmount: number;
  maxInternationalTransactionAmount: number;
  internationalTransactionFee: number;
  internationalTransactionFeeCurrencyCode: string;
  localTransactionFeePercentage: number;
  internationalTransactionFeePercentage: number;
  internationalDiscountPercentage: number;
  requiresInvoice: boolean;
  logoUrls: string[],
  fx: {
    rate: number;
    currencyCode: string;
  };
  denominationType: 'RANGE' | 'FIXED';
  localFixedAmounts: number | null;
  internationalFixedAmounts: number | null;
};
