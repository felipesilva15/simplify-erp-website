export interface LookupFilter {
  q: string;
  keys?: (string | number)[]
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}