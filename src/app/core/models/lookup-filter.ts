export interface LookupFilter {
  q: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}