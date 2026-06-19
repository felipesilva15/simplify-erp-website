export interface LookupFilter {
  q: string;
  keys?: Array<string | number>
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}