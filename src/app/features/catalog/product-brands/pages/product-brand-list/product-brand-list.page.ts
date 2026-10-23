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
import { ProductBrand } from '../../models/product-brand';
import { ProductBrandService } from '../../services/product-brand-service';

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
  selector: 'app-product-brand-list',
  imports: [
    ListPageUi,
    CrudListComponent,
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: ProductBrandService) => new CrudListFacade<ProductBrand>(service, {
        create: 'productBrands.create',
        update: 'productBrands.update',
        view: 'productBrands.view',
        delete: 'productBrands.delete'
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        ProductBrandService
      ]
    }
  ],
  templateUrl: './product-brand-list.page.html',
  styleUrl: './product-brand-list.page.scss',
})
export class ProductBrandListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<ProductBrand> = inject(CrudListFacade<ProductBrand>);

  title: WritableSignal<string> = signal<string>('Listar marcas')
  breadcrumbItems: MenuItem[] = [
    { label: 'Catálogo' },
    { label: 'Marcas' },
    { label: 'Listar', routerLink: '/catalog/product-brands' }
  ];
  cols: TableColumn<ProductBrand>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
  ]
  tableMenu: TableMenuItem<ProductBrand>[] = [
    {
      label: 'Visualizar',
      icon: 'pi pi-eye',
      permission: 'productBrands.view',
      action: (record?: ProductBrand) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      permission: 'productBrands.edit',
      action: (record?: ProductBrand) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Deletar',
      icon: 'pi pi-trash',
      permission: 'productBrands.delete',
      action: (record?: ProductBrand) => record && this.facade.delete(record)
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
