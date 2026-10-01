import { PipeTransform } from '@angular/core';
import { ColumnType } from '../enums/column-type';

/**
 * Definição de um campo de um item filho, usada para montar as colunas da
 * tabela resumida (`ChildEntityViewMode.ReadonlyTableModal`).
 *
 * É intencionalmente mais enxuta que `TableColumn<T>`: aqui não há ordenação,
 * seleção nem template por célula — a apresentação é gerada a partir do
 * `ColumnType`.
 */
export interface ChildFieldDefinition {
    field: string;
    header: string;
    type?: ColumnType;
    pipe?: PipeTransform;
    pipeArgs?: unknown[];
    enumOptionLabels?: Record<string, string>;
}
