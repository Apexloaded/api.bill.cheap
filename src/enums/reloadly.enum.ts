import { isDev } from '@/utils/helpers';

export enum ReloadlySubPath {
  Auth = 'auth',
}

export const reloadlyPath = {
  auth: 'oauth/token',
  accountBalance: 'accounts/balance',
  countries: 'countries',
  operators: 'operators',
  countryOperators: (iso: string) => `operators/countries/${iso}`,
  topUp: 'topups',
  topUpStatus: (txId: string) => `topups/${txId}/status`,
  autoDetectProvider: (phone: string, iso: string) =>
    `operators/auto-detect/phone/${phone}/countries/${iso}`,
  fxRate: 'operators/fx-rate',
  billers: 'billers',
  pay: 'pay',
  transactions: 'transactions'
};

export enum AudienceType {
  Topups = 'topups',
  Utilities = 'utilities',
}

export const Audience = {
  [AudienceType.Topups]: 'topups-sandbox',
  [AudienceType.Utilities]: 'utilities-sandbox',
  // [AudienceType.Airtime]: isDev ? 'topups-sandbox' : 'topups',
  // [AudienceType.Utilities]: isDev ? 'utilities-sandbox' : 'utilities',
};
