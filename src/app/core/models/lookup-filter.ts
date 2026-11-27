import { RequestFiltersType } from '../types/request-filters-type';

export interface LookupFilter {
  q: string;
  keys?: (string | number)[]
  page?: number;
  pageSize?: number;
  /** Filtros fixos no mesmo formato das listagens: `filters[property][operator]=search`. */
  filters?: RequestFiltersType;
  [key: string]: unknown;
}