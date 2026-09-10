import { ColumnType } from '../../../core/enums/column-type';
import { TableColumn } from '../../../core/models/table-column';
import { Component, inject, input, Input, InputSignal, model, ModelSignal, OnDestroy, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe, NgTemplateOutlet, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { ContextMenuModule } from 'primeng/contextmenu';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { TableMenuItem } from '../../../core/models/table-menu-item';
import { CrudListFacade } from '../../facades/crud-list.facade';
import { BaseEntity } from '../../../core/models/base-entity';
import { FilterDefinerComponent } from "../filter-definer/filter-definer.component";
import { FilterFieldDefinition } from '../../../core/models/filter-field-definition';

@Component({
  selector: 'app-crud-list',
  imports: [
    RouterLink,
    TableModule,
    SkeletonModule,
    ButtonModule,
    TooltipModule,
    ContextMenuModule,
    MenuModule,
    CheckboxModule,
    PaginatorModule,
    FormsModule,
    NgTemplateOutlet,
    FilterDefinerComponent
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    PercentPipe
  ],
  templateUrl: './crud-list.component.html',
  styleUrl: './crud-list.component.scss',
})
export class CrudListComponent<T extends BaseEntity> implements OnInit, OnDestroy {
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private percentPipe = inject(PercentPipe);

  readonly cardClass = 'surface-card border-1 border-round p-3 transition-all transition-duration-200';
  readonly cardHeaderClass = 'flex align-items-center justify-content-between gap-2 pb-2 mb-2 border-bottom-1 surface-border';

  @Input({ required: true }) cols: TableColumn<T>[] = [];
  @Input() tableMenu: TableMenuItem<T>[] = [];
  @Input() facade!: CrudListFacade<T>;
  formRoute: InputSignal<string> = input<string>('new');
  enableSelection: InputSignal<boolean> = input<boolean>(false);
  lazyLoadEnabled: InputSignal<boolean> = input<boolean>(true);
  filterFieldDefinition: ModelSignal<FilterFieldDefinition[]> = model<FilterFieldDefinition[]>([]);

  rows = 10;
  first = 0;
  rowsPerPageOptions: number[] = [3, 5, 10, 20, 50];
  menuItems: MenuItem[] = [];
  columnCount: WritableSignal<number> = signal(0);
  isMobile: WritableSignal<boolean> = signal(false);

  selectedRecords: T[] = [];
  currentRecord?: T;

  @ViewChild('cm') cm!: Menu;
  @ViewChild('mobileMenu') mobileMenu!: Menu;

  private mobileMediaQuery?: MediaQueryList;
  private onMediaChange = (event: MediaQueryListEvent): void => {
    this.isMobile.set(event.matches);
  };

  ngOnInit(): void {
    this.columnCount.set(this.cols.length + (this.enableSelection() ? 1 : 0));
    this.setupMediaQuery();

    if (this.lazyLoadEnabled()) {
      this.onLazyLoad({ first: this.first, rows: this.rows });
    } else {
      this.facade.load();
    }

    this.filterFieldDefinition.update((definitions: FilterFieldDefinition[]) => {
      definitions.push(
        { name: 'created_at', label: 'Criado em', type: ColumnType.Datetime },
        { name: 'updated_at', label: 'Atualizado em', type: ColumnType.Datetime },
      );

      return definitions;
    });
  }

  ngOnDestroy(): void {
    this.mobileMediaQuery?.removeEventListener('change', this.onMediaChange);
  }

  private setupMediaQuery(): void {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.mobileMediaQuery = window.matchMedia('(max-width: 768px)');
      this.isMobile.set(this.mobileMediaQuery.matches);
      this.mobileMediaQuery.addEventListener('change', this.onMediaChange);
    }
  }

  formatRowValue(record: T, column: TableColumn<T>): string {
    const value: any = record[column.field] ?? '';

    if (column.pipe) {
      return column.pipe.transform(value, ...(column.pipeArgs ?? []));
    }

    switch (column.type) {
      case ColumnType.Date:
        return this.datePipe.transform(value, 'dd/MM/yyyy') ?? '';

      case ColumnType.Datetime:
        return this.datePipe.transform(value, 'dd/MM/yyyy hh:mm:ss') ?? '';

      case ColumnType.Currency:
        return this.currencyPipe.transform(value, 'BRL') ?? '';

      case ColumnType.Percent:
        return this.percentPipe.transform(value) ?? '';

      case ColumnType.Boolean:
        return value ? 'Sim' : 'Não';

      case ColumnType.Enum:
        return column.enumOptionLabels ? column.enumOptionLabels[value] : value;

      default:
        return String(value);
    }
  }

  onContextMenuSelect(event: any): void {
    this.buildMenuItems(event.data);
  }

  onMobileMenuClick(event: Event, record: T): void {
    this.buildMenuItems(record);
    this.mobileMenu.toggle(event);
  }

  private buildMenuItems(record: T): void {
    this.menuItems = this.tableMenu.map(item => ({
      ...item,
      disabled: !this.facade.can(item.permission),
      command: () => item.action && item.action(record)
    }));
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    if (!this.lazyLoadEnabled()) {
      return;
    }

    const perPage = event.rows ?? this.rows;
    const page = Math.floor((event.first ?? 0) / perPage) + 1;

    let sorts: string | undefined;
    if (event.sortField) {
      const field = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
      sorts = event.sortOrder === -1 ? `-${field}` : field;
    }

    this.facade.applyLazyLoad(page, perPage, sorts);
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;

    if (this.lazyLoadEnabled()) {
      this.onLazyLoad(event);
    }
  }

  isSelected(record: T): boolean {
    return this.selectedRecords.some(selected => selected.id === record.id);
  }

  toggleSelection(record: T, checked: boolean): void {
    this.selectedRecords = checked
      ? [...this.selectedRecords, record]
      : this.selectedRecords.filter(selected => selected.id !== record.id);
  }

  mobileDisplayData(): T[] {
    const data = this.facade.data();

    return this.lazyLoadEnabled() ? data : data.slice(this.first, this.first + this.rows);
  }

  mobileTotalRecords(): number {
    return this.lazyLoadEnabled() ? this.facade.totalRecords() : this.facade.data().length;
  }

  mobileTitleColumn(): TableColumn<T> | undefined {
    return this.cols.find(column => !column.template && column.field === 'name')
      ?? this.cols.find(column => !column.template);
  }

  mobileCardTitle(record: T): string {
    const titleColumn = this.mobileTitleColumn();
    const value = titleColumn ? this.formatRowValue(record, titleColumn) : '';

    return value || `#${record.id}`;
  }

  mobileBodyColumns(): TableColumn<T>[] {
    return this.cols.filter(column => column !== this.mobileTitleColumn() && column.field !== 'id');
  }
}
