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
import { MeasurementUnit } from '../../models/measurement-unit';
import { MeasurementUnitService } from '../../services/measurement-unit-service';
import { MeasurementUnitLookupComponent } from '../../components/measurement-unit-lookup/measurement-unit-lookup.component';
import { MeasurementUnitCategoryLabels, MeasurementUnitCategoryOptions } from '../../enums/measurement-unit-category';

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
  selector: 'app-measurement-unit-list',
  imports: [
    ListPageUi,
    CrudListComponent,
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: MeasurementUnitService) => new CrudListFacade<MeasurementUnit>(service, {
        create: 'measurementUnits.create',
        update: 'measurementUnits.update',
        view: 'measurementUnits.view',
        delete: 'measurementUnits.delete'
      }, {
        exportMenu: exportMenu,
        beforeDelete: (entity) => {
          if (entity.is_system) {
            return 'Não é possível excluir uma unidade de medida controlada pelo sistema.';
          }

          return true
        },
      }),
      deps: [
        MeasurementUnitService
      ]
    }
  ],
  templateUrl: './measurement-unit-list.page.html',
  styleUrl: './measurement-unit-list.page.scss',
})
export class MeasurementUnitListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<MeasurementUnit> = inject(CrudListFacade<MeasurementUnit>);

  title: WritableSignal<string> = signal<string>('Listar unidades de medida')
  breadcrumbItems: MenuItem[] = [
    { label: 'Catálogo' },
    { label: 'Unidades de medida' },
    { label: 'Listar', routerLink: '/catalog/measurement-units' }
  ];
  cols: TableColumn<MeasurementUnit>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'category', header: 'Categoria', sortable: true, type: ColumnType.Enum, enumOptionLabels: MeasurementUnitCategoryLabels },
    { field: 'code', header: 'Código', sortable: true, type: ColumnType.Text },
    { field: 'symbol', header: 'Símbolo', sortable: true, type: ColumnType.Text },
    { field: 'conversion_factor', header: 'Fator de conversão', sortable: true, type: ColumnType.Decimal, pipeArgs: ['1.2-8'] },
    { field: 'decimal_places', header: 'Casas decimais', sortable: true, type: ColumnType.Integer },
    { field: 'external_code', header: 'Código externo', sortable: true, type: ColumnType.Text },
    { field: 'is_active', header: 'Ativo', sortable: true, type: ColumnType.Boolean },
    { field: 'is_system', header: 'Sistêmico', sortable: true, type: ColumnType.Boolean },
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'category', label: 'Categoria', type: ColumnType.Enum, options: MeasurementUnitCategoryOptions },
    { name: 'code', label: 'Código', type: ColumnType.Text },
    { name: 'symbol', label: 'Símbolo', type: ColumnType.Text },
    { name: 'base_unit_id', label: 'Unidade de medida base', type: ColumnType.Lookup, component: MeasurementUnitLookupComponent },
    { name: 'conversion_factor', label: 'Fator de conversão', type: ColumnType.Decimal },
    { name: 'decimal_places', label: 'Casas decimais', type: ColumnType.Decimal },
    { name: 'external_code', label: 'Código externo', type: ColumnType.Text },
    { name: 'is_active', label: 'Ativo', type: ColumnType.Boolean },
    { name: 'is_system', label: 'Sistêmico', type: ColumnType.Boolean },
  ]
  tableMenu: TableMenuItem<MeasurementUnit>[] = [
    {
      label: 'Visualizar',
      icon: 'pi pi-eye',
      permission: 'measurementUnits.view',
      action: (record?: MeasurementUnit) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      permission: 'measurementUnits.edit',
      action: (record?: MeasurementUnit) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Deletar',
      icon: 'pi pi-trash',
      permission: 'measurementUnits.delete',
      action: (record?: MeasurementUnit) => record && this.facade.delete(record)
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
