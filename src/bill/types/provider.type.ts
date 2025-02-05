export type Provider = {
  id: number;
  operatorId: number;
  name: string;
  bundle: boolean;
  data: boolean;
  pin: boolean;
  comboProduct: boolean;
  supportsLocalAmounts: boolean;
  supportsGeographicalRechargePlans: boolean;
  denominationType: 'RANGE' | 'FIXED'; // Union type for known values
  senderCurrencyCode: string;
  senderCurrencySymbol: string;
  destinationCurrencyCode: string;
  destinationCurrencySymbol: string;
  commission: number;
  internationalDiscount: number;
  localDiscount: number;
  mostPopularAmount: number | null;
  mostPopularLocalAmount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  localMinAmount: number | null;
  localMaxAmount: number | null;
  country: {
    isoName: string;
    name: string;
  };
  fx: {
    rate: number;
    currencyCode: string;
  };
  logoUrls: string[];
  fixedAmounts: number[];
  fixedAmountsDescriptions: Record<string, string>; // Object with string keys and values
  localFixedAmounts: number[];
  localFixedAmountsDescriptions: Record<string, string> | null;
  suggestedAmounts: number[];
  suggestedAmountsMap: Record<string, string>; // Map for suggested amounts
  fees: {
    international: number;
    local: number;
    localPercentage: number;
    internationalPercentage: number;
  };
  geographicalRechargePlans: any[]; // Assuming it's an array of unknown structure
  promotions: any[]; // Assuming it's an array of unknown structure
  status: 'ACTIVE' | 'INACTIVE'; // Union type for known statuses
};

export type SelectProvider = {
  providers: Provider[];
  inputedProviderName: string;
  callingCode?: string;
  isoCode?: string;
};

export type PaginatedProviderList = {
  content: Provider[];
  pageable: {
    sort: { unsorted: boolean; sorted: boolean; empty: boolean };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  sort: { unsorted: boolean; sorted: boolean; empty: boolean };
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
};
