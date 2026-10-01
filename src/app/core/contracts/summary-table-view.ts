import { Signal } from '@angular/core';
import { ChildFieldDefinition } from '../models/child-field-definition';
import { ChildRowErrors } from '../models/child-row-errors';

/**
 * Estado que a tabela resumida consome. É a superfície de leitura do modo
 * `ReadonlyTableModal` — deliberadamente própria, para não criar uma interface
 * genérica que tente servir aos dois modos de visualização.
 *
 * A view recebe estado e emite intents; nunca manipula o array de itens.
 */
export interface SummaryTableView<T> {
    items: Signal<T[]>;
    columns: Signal<ChildFieldDefinition[]>;
    disabled: Signal<boolean>;
    emptyMessage: Signal<string>;

    /** Erros do item na posição informada, para o indicador da linha. */
    rowErrors: (index: number) => ChildRowErrors;

    /** Quantidade de mensagens de erro do item, para o badge. */
    itemErrorCount: (index: number) => number;
}
