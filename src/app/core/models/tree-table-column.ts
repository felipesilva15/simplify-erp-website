import { PipeTransform, TemplateRef } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { ColumnType } from '../enums/column-type';

/**
 * Definição genérica de coluna para tabelas em árvore.
 *
 * Segue o mesmo contrato de formatação de `TableColumn` (usado pelo
 * `app-crud-list`), mas sem vínculo com nenhum modelo de domínio.
 */
export interface TreeTableColumn {
  field: string;
  header: string;
  /** Permite ordenar a árvore por esta coluna. */
  sortable?: boolean;
  type?: ColumnType;
  pipe?: PipeTransform;
  pipeArgs?: unknown[];
  enumOptionLabels?: Record<string, string>;
  /** Template opcional para substituir a renderização padrão da célula. */
  template?: TemplateRef<{ $implicit: unknown; node: TreeNode; first: boolean }>;
}
