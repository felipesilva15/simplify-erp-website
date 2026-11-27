import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ColumnType } from '../../../../../core/enums/column-type';
import { ExportExtension } from '../../../../../core/enums/export-extension';
import { ExportFormat } from '../../../../../core/enums/export-format';
import { ExportMenuItem } from '../../../../../core/models/export-menu-item';
import { FilterOperator } from '../../../../../core/enums/filter-operator';
import { TreeListConfig } from '../../../../../core/models/tree-list-config';
import { FilterFieldDefinition } from '../../../../../core/models/filter-field-definition';
import { TreeTableColumn } from '../../../../../core/models/tree-table-column';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { TreeCrudListComponent } from '../../../../../shared/components/tree-crud-list/tree-crud-list.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { ListPageUi } from '../../../../../shared/ui/list-page/list-page.ui';
import { FinanceCategory } from '../../models/finance-category';
import { FinanceCategoryService } from '../../services/finance-category-service';
import { FinanceCategoryLookupComponent } from '../../components/finance-category-lookup/finance-category-lookup.component';
import { FinanceApplicabilityLabels, FinanceApplicabilityOptions } from '../../../payment-methods/enums/finance-applicability';

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
  selector: 'app-finance-category-list',
  imports: [
    ListPageUi,
    TreeCrudListComponent,
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: FinanceCategoryService) => new CrudListFacade<FinanceCategory>(service, {
        create: 'financeCategories.create',
        update: 'financeCategories.update',
        view: 'financeCategories.view',
        delete: 'financeCategories.delete'
      }, {
        fixedFilters: { parent_id: { [FilterOperator.Equal]: null } },
        fetchAll: true,
        exportMenu: exportMenu
      }),
      deps: [
        FinanceCategoryService
      ]
    }
  ],
  templateUrl: './finance-category-list.page.html',
  styleUrl: './finance-category-list.page.scss',
})
export class FinanceCategoryListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<FinanceCategory> = inject(CrudListFacade<FinanceCategory>);

  title: WritableSignal<string> = signal<string>('Listar categorias')
  breadcrumbItems: MenuItem[] = [
    { label: 'Financeiro' },
    { label: 'Categorias' },
    { label: 'Listar', routerLink: '/finance/finance-categories' }
  ];
  cols: TreeTableColumn[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'code', header: 'Código', sortable: true, type: ColumnType.Text },
    { field: 'applicable_type', header: 'Aplicável a', sortable: true, type: ColumnType.Enum, enumOptionLabels: FinanceApplicabilityLabels },
  ];
  treeConfig: TreeListConfig = {
    idKey: 'id',
    parentKey: 'parent_id',
    labelKey: 'name',
    rootFilter: { parent_id: { [FilterOperator.Equal]: null } },
    levelColors: {
      0: 'bg-primary-300',
      1: 'bg-primary-100',
      2: 'bg-primary-50'
    }
  };
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'code', label: 'Código', type: ColumnType.Text },
    { name: 'parent_id', label: 'Categoria pai', type: ColumnType.Lookup, component: FinanceCategoryLookupComponent },
    { name: 'applicable_type', label: 'Aplicável a', type: ColumnType.Enum, options: FinanceApplicabilityOptions },
  ]
  tableMenu: TableMenuItem<FinanceCategory>[] = [
    {
      label: 'Visualizar',
      icon: 'pi pi-eye',
      permission: 'financeCategories.view',
      action: (record?: FinanceCategory) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      permission: 'financeCategories.edit',
      action: (record?: FinanceCategory) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Deletar',
      icon: 'pi pi-trash',
      permission: 'financeCategories.delete',
      action: (record?: FinanceCategory) => record && this.facade.delete(record)
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
