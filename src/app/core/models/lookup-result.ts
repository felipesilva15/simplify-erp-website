import { LookupItem } from "./lookup-item";

export interface LookupResult {
  items: LookupItem[];
  total: number;
  page: number;
  perPage: number;
}