export type PaginatedProviderList<T> = {
  content: T[];
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
