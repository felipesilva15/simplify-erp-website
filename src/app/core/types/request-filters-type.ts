
import { FieldFilterType } from "./field-filter-type";

export type RequestFiltersType<T> = Record<keyof T, FieldFilterType>;