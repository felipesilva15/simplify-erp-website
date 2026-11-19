import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, inject, input, model, output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import type { Menu } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { ColumnType } from '../../../core/enums/column-type';
import { TreeTableColumn } from '../../../core/models/tree-table-column';
import { TreeTableSelecionKey } from '../../../core/models/tree-table-selection-key';
import { CellValueFormatterService } from '../../services/cell-value-formatter.service';

/**
 * Tabela em árvore genérica. Não conhece entidades, colunas fixas nem facades:
 * recebe os nós e a definição das colunas, e delega a formatação ao
 * `CellValueFormatterService`, o mesmo usado pelo `app-crud-list`.
 */
@Component({
  selector: 'app-tree-view',
  imports: [TreeTableModule, TooltipModule, NgTemplateOutlet],
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss',
})
export class TreeViewComponent {
  private cellValueFormatter = inject(CellValueFormatterService);

  nodes = input.required<TreeNode[]>();
  columns = input.required<TreeTableColumn[]>();
  selectionKeys = model<Record<string, TreeTableSelecionKey>>({});
  selectionMode = input<string | undefined>(undefined);
  levelColors = input<Record<number, string>>({});
  dataKey = input<string>('key');
  scrollable = input<boolean>(true);
  scrollHeight = input<string>('400px');
  minWidth = input<string>('50rem');
  loading = input<boolean>(false);
  expandAll = input<boolean>(false);
  emptyMessage = input<string>('Nenhum registro encontrado.');
  /** Menu de contexto exibido ao clicar com o botão direito em uma linha. */
  contextMenu = input<Menu | undefined>(undefined);

  contextMenuSelect = output<{ event: Event; record: unknown }>();

  readonly ColumnType = ColumnType;

  constructor() {
    effect(() => {
      const nodes = this.nodes() ?? [];
      const expand = this.expandAll();
      this.setExpanded(nodes, expand);
    });
  }

  formatValue(record: unknown, column: TreeTableColumn): string {
    return this.cellValueFormatter.format(record, column);
  }

  isTruthyValue(record: unknown, column: TreeTableColumn): boolean {
    return !!this.cellValueFormatter.resolve(record, column.field);
  }

  onContextMenuSelect(event: { originalEvent: Event; node: TreeNode }): void {
    this.contextMenuSelect.emit({ event: event.originalEvent, record: event.node.data });
  }

  private setExpanded(nodes: TreeNode[], expanded: boolean): void {
    nodes.forEach(node => {
      node.expanded = expanded && !!node.children?.length;
      if (node.children?.length) {
        this.setExpanded(node.children, expanded);
      }
    });
  }
}
