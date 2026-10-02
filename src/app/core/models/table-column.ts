import { PipeTransform, TemplateRef } from "@angular/core";
import { ColumnType } from "../enums/column-type";

export interface TableColumn<_T> {
    field: string;
    header: string;
    sortable?: boolean;
    type?: ColumnType;
    pipe?: PipeTransform;
    pipeArgs?: any[];
    enumOptionLabels?: Record<any, string>;
    template?: TemplateRef<any>;
}
