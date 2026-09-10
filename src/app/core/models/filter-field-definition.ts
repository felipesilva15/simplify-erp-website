import { Type } from "@angular/core";
import { ColumnType } from "../enums/column-type";
import { ControlValueAccessor } from "@angular/forms";

export interface FilterFieldDefinition {
    name: string;
    label: string;
    type: ColumnType;
    mask?: string;
    options?: { code: string, name: string }[];
    component?: Type<ControlValueAccessor>;
}
