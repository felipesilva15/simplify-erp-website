import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ColumnType } from '../../../../../core/enums/column-type';
import { ExportExtension } from '../../../../../core/enums/export-extension';
import { ExportFormat } from '../../../../../core/enums/export-format';
import { ExportMenuItem } from '../../../../../core/models/export-menu-item';
import { FilterFieldDefinition } from '../../../../../core/models/filter-field-definition';
import { TableColumn } from '../../../../../core/models/table-column';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { CrudListComponent } from '../../../../../shared/components/crud-list/crud-list.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { ListPageUi } from '../../../../../shared/ui/list-page/list-page.ui';
import { Warehouse } from '../../models/warehouse';
import { WarehouseService } from '../../services/warehouse-service';

const exportMenu: ExportMenuItem[] = [
  {
    label: 'Completo (Excel)',
    icon: 'pi pi-file-excel',
    extension: ExportExtension.Xlsx,
    format: ExportFormat.Completo,
  },
  {
    label: 'Completo (CSV)',
    icon: 'pi pi-file',
    extension: ExportExtension.Csv,
    format: ExportFormat.Completo,
  }
];

@Component({
  selector: 'app-warehouse-list',
  imports: [
    ListPageUi,
    CrudListComponent,
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: WarehouseService) => new CrudListFacade<Warehouse>(service, {
        create: 'warehouses.create',
        update: 'warehouses.update',
        view: 'warehouses.view',
        delete: 'warehouses.delete'
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        WarehouseService
      ]
    }
  ],
  templateUrl: './warehouse-list.page.html',
  styleUrl: './warehouse-list.page.scss',
})
export class WarehouseListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<Warehouse> = inject(CrudListFacade<Warehouse>);

  title: WritableSignal<string> = signal<string>('Listar armazéns')
  breadcrumbItems: MenuItem[] = [
    { label: 'Estoque' },
    { label: 'Armazéns' },
    { label: 'Listar', routerLink: '/inventory/warehouses' }
  ];
  cols: TableColumn<Warehouse>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'is_active', header: 'Ativo', sortable: true, type: ColumnType.Boolean },
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'is_active', label: 'Ativo', type: ColumnType.Boolean },
  ]
  tableMenu: TableMenuItem<Warehouse>[] = [
    {
      label: 'Visualizar',
      icon: 'pi pi-eye',
      permission: 'warehouses.view',
      action: (record?: Warehouse) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      permission: 'warehouses.edit',
      action: (record?: Warehouse) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Deletar',
      icon: 'pi pi-trash',
      permission: 'warehouses.delete',
      action: (record?: Warehouse) => record && this.facade.delete(record)
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
