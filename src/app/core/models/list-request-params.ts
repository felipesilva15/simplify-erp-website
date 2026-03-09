import { RequestFiltersType } from "../types/request-filters-type";

export interface ListRequestParams<T> {
    filters?: RequestFiltersType<T>;
    sorts?: string;
    per_page?: number;
    page?: number;
}
