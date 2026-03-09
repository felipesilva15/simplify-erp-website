import { FilterOperator } from "../enums/filter-operator";
import { FieldFilterValueType } from "./field-filter-value-type";

export type FieldFilterType = {
  [key in FilterOperator]: FieldFilterValueType;
};;