import { Component, computed, DestroyRef, effect, inject, input, model, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, distinctUntilChanged, Subject, timer } from 'rxjs';
import { Menu, MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuItem, TreeNode } from 'primeng/api';
import { BaseEntity } from '../../../core/models/base-entity';
import { ColumnType } from '../../../core/enums/column-type';
import { FilterFieldDefinition } from '../../../core/models/filter-field-definition';
import { TableMenuItem } from '../../../core/models/table-menu-item';
import { TreeListConfig } from '../../../core/models/tree-list-config';
import { TreeTableColumn } from '../../../core/models/tree-table-column';
import { TreeNodeBuilder } from '../../../core/services/tree-node-builder';
import { CrudListFacade } from '../../facades/crud-list.facade';
import { ExportMenuItem } from '../../../core/models/export-menu-item';
import { FilterDefinerComponent } from '../filter-definer/filter-definer.component';
import { ListToolbarComponent } from '../list-toolbar/list-toolbar.component';
import { TreeViewComponent } from '../tree-view/tree-view.component';

/**
 * Listagem genérica em árvore. Reutiliza o `CrudListFacade` para dados,
 * busca, filtros, exportação e permissões, e renderiza o resultado com o
 * `app-tree-view`, independentemente do modelo de dados ou das colunas.
 */
@Component({
  selector: 'app-tree-crud-list',
  imports: [
    ListToolbarComponent,
    TreeViewComponent,
    FilterDefinerComponent,
    MenuModule,
    SkeletonModule
  ],
  templateUrl: './tree-crud-list.component.html',
  styleUrl: './tree-crud-list.component.scss',
})
export class TreeCrudListComponent<T extends BaseEntity> implements OnInit, OnDestroy {
  private treeNodeBuilder = inject(TreeNodeBuilder);
  private destroyRef = inject(DestroyRef);

  cols = input.required<TreeTableColumn[]>();
  facade = input.required<CrudListFacade<T>>();
  treeConfig = input.required<TreeListConfig>();
  tableMenu = input<TableMenuItem<T>[]>([]);
  formRoute = input<string>('new');
  enableSearch = input<boolean>(false);
  searchPlaceholder = input<string>('Buscar...');
  searchDelay = input<number>(600);
  filterFieldDefinition = model<FilterFieldDefinition[]>([]);

  nodes: WritableSignal<TreeNode[]> = signal<TreeNode[]>([]);
  searchTerm = signal<string>('');
  menuItems: MenuItem[] = [];
  exportMenuItems: MenuItem[] = [];

  levelColors = computed(() => this.treeConfig().levelColors ?? {});
  expandAll = computed(() => this.treeConfig().expandAll ?? false);
  @ViewChild('exportMenu') exportMenu!: Menu;

  private searchInput$ = new Subject<string>();

  constructor() {
    effect(() => {
      const data = this.facade().data();
      const config = this.treeConfig();

      this.nodes.set(this.treeNodeBuilder.buildFromFlat(data, {
        idKey: config.idKey ?? 'id',
        parentKey: config.parentKey ?? 'parent_id',
        labelKey: config.labelKey ?? 'name',
        rootFilter: config.rootFilter,
        keySeparator: config.keySeparator,
      }));
    });
  }

  ngOnInit(): void {
    this.buildExportMenuItems();
    this.filterFieldDefinition.update(definitions => {
      const existing = new Set(definitions.map(definition => definition.name));
      const defaults: FilterFieldDefinition[] = [
        { name: 'created_at', label: 'Criado em', type: ColumnType.Datetime },
        { name: 'updated_at', label: 'Atualizado em', type: ColumnType.Datetime },
      ].filter(definition => !existing.has(definition.name));

      return defaults.length ? [...definitions, ...defaults] : definitions;
    });

    this.searchInput$
      .pipe(
        debounce(() => timer(this.searchDelay())),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term: string) => this.facade().applySearch(term));

    this.facade().load();
  }

  ngOnDestroy(): void {
    this.searchInput$.complete();
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.searchInput$.next(value);
  }

  onSearchClear(): void {
    this.searchTerm.set('');
    this.searchInput$.next('');
  }

  onContextMenuSelect(event: { event: Event; record: unknown }): void {
    const record = event.record as T;
    this.menuItems = this.tableMenu().map(item => ({
      ...item,
      disabled: !this.facade().can(item.permission),
      command: () => item.action && item.action(record)
    }));
  }

  onExportMenuClick(event: Event): void {
    this.exportMenu.toggle(event);
  }

  private buildExportMenuItems(): void {
    this.exportMenuItems = this.facade().exportMenu().map((item: ExportMenuItem) => ({
      ...item,
      disabled: !this.facade().can(item.permission),
      command: item.command ?? (() => this.facade().export(item.format, item.extension))
    }));
  }
}
