import { Component, computed, input, Input, InputSignal, OnInit, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/api-response';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { RouterLink } from '@angular/router';
import { required } from '@angular/forms/signals';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TableMenuItem } from '../../../core/models/table-menu-item';

@Component({
  selector: 'app-master-list',
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
    MenuModule
  ],
  templateUrl: './master-list.component.html',
  styleUrl: './master-list.component.scss',
})
export class MasterListComponent<T> implements OnInit {
  @Input({ required: true }) listFn!: (params: any) => Observable<ApiResponse<any>>;
  @Input({ required: true }) cols: any[] = [];
  @Input() tableMenu: TableMenuItem<T>[] = [];
  formRoute: InputSignal<string> = input<string>('form');
  enableSelection: InputSignal<boolean> = input<boolean>(true);
  
  response!: ApiResponse<T[]>;
  records: T[] = [];
  isLoading: WritableSignal<boolean> = signal<boolean>(true);
  selectedRecords: T[] = [];
  currentRecord?: T;
  globalFilterFields: string[] = [];
  rows: number = 10;
  rowsPerPage: number[] = [10, 20, 30];
  filters?: any;
  columnCount: Signal<number> = computed(() => {
    return this.cols.length + (this.enableSelection() ? 1 : 0);
  });
  menuItems: MenuItem[] = [];

  @ViewChild('cm') cm!: Menu;

  ngOnInit(): void {
    this.loadInfo();

    this.globalFilterFields = this.cols.map(r => r.field);
  }

  loadInfo(): void {
    this.isLoading.set(true);

    this.listFn(this.filters).subscribe({
      next: (res: ApiResponse<T[]>) => {
        this.response = res;
        this.records = res.data;
        this.isLoading.set(false);
      }
    });
  }

  onContextMenuSelect(event: any) {
    this.currentRecord = event.data;

    this.menuItems = this.tableMenu.map(item => ({
      ...item,
      command: () => {
        if (item.action)
          item.action(this.currentRecord)
      }
    }));
  }
}
