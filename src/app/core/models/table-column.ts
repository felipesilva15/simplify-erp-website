import { PipeTransform, TemplateRef } from "@angular/core";
import { ColumnType } from "../enums/column-type";

export interface TableColumn<T> {
    field: keyof T;
    header: string;
    sortable?: boolean;
    type?: ColumnType;
    pipe?: PipeTransform;
    pipeArgs?: any[];
    template?: TemplateRef<any>;
}
