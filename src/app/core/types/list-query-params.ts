import { SortDirection } from "../enums/sort-direction";

export type ListQueryParams<T> = {
  perPage?: number;
  page?: number;
  sortBy?: Array<keyof T>;
  sortDir?: SortDirection[];
} & T;