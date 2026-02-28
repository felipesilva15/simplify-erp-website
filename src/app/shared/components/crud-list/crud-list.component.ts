import { ListQueryParams } from './../../../core/types/list-query-params';
import { ColumnType } from '../../../core/enums/column-type';
import { TableColumn } from '../../../core/models/table-column';
import { Component, computed, inject, input, Input, InputSignal, OnInit, Signal, signal, TemplateRef, ViewChild, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe, NgTemplateOutlet, PercentPipe } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { RouterLink } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TableMenuItem } from '../../../core/models/table-menu-item';
import { User } from '../../../features/security/users/models/user';
import { CrudListFacade } from '../../facades/crud-list.facade';
import { BaseEntity } from '../../../core/models/base-entity';

@Component({
  selector: 'app-crud-list',
  imports: [
    RouterLink,
    ToolbarModule,
    TableModule,
    SkeletonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    TooltipModule,
    ContextMenuModule,
    MenuModule,
    NgTemplateOutlet
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    PercentPipe
  ],
  templateUrl: './crud-list.component.html',
  styleUrl: './crud-list.component.scss',
})
export class CrudListComponent<T extends BaseEntity> implements OnInit {
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private percentPipe = inject(PercentPipe);

  @Input({ required: true }) cols: TableColumn<T>[] = [];
  @Input() tableMenu: TableMenuItem<T>[] = [];
  @Input() facade!: CrudListFacade<T>;
  formRoute: InputSignal<string> = input<string>('form');
  enableSelection: InputSignal<boolean> = input<boolean>(true);
  
  rows: number = 10;
  rowsPerPageOptions: number[] = [10, 20, 30];
  menuItems: MenuItem[] = [];
  columnCount: Signal<number> = computed(() => {
    return this.cols.length + (this.enableSelection() ? 1 : 0);
  });

  selectedRecords: T[] = [];
  currentRecord?: T;
  filters?: ListQueryParams<T>;

  @ViewChild('cm') cm!: Menu;

  ngOnInit(): void {
    this.facade.load();
  }

  formatRowValue(row: any, column: TableColumn<T>): string {
    const value = row[column.field] ?? '';

    if (column.pipe) {
      return column.pipe.transform(value, ...(column.pipeArgs ?? []));
    }

    switch (column.type) {
      case ColumnType.DATE:
        return this.datePipe.transform(value, 'dd/MM/yyyy') ?? '';

      case ColumnType.DATETIME:
        return this.datePipe.transform(value, 'dd/MM/yyyy hh:mm:ss') ?? '';

      case ColumnType.CURRENCY:
        return this.currencyPipe.transform(value, 'BRL') ?? '';

      case ColumnType.PERCENT:
        return this.percentPipe.transform(value) ?? '';

      default:
        return value;
    }
  }

  onContextMenuSelect(event: any) {
    this.currentRecord = event.data;

    this.menuItems = this.tableMenu.map(item => ({
      ...item,
      disabled: !this.facade.can(item.permission),
      command: () => item.action && item.action(this.currentRecord)
    }));
  }
}
