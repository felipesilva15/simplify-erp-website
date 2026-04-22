export interface LookupFilter {
  query: string;
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}