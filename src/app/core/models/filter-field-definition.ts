import { ColumnType } from "../enums/column-type";

export interface FilterFieldDefinition {
    name: string;
    label: string;
    type: ColumnType;
}
