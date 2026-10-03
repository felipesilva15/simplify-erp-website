import { RequestFiltersType } from "../types/request-filters-type";

export interface ListRequestParams {
    filters?: RequestFiltersType;
    sorts?: string;
    q?: string;
    per_page?: number;
    page?: number;
}
