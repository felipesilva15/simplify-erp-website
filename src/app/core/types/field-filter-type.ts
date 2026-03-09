import { FilterOperator } from "../enums/filter-operator";

export type FieldFilterType = Partial<Record<FilterOperator, any>>;