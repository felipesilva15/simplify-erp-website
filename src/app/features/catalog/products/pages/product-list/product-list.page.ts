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
import { Product } from '../../models/product';
import { ProductService } from '../../services/product-service';
import { ItemTypeCodeLabels, ItemTypeCodeOptions } from '../../enums/item-type-code';
import { MeasurementUnitLookupComponent } from '../../../measurement-units/components/measurement-unit-lookup/measurement-unit-lookup.component';
import { ProductCategoryLookupComponent } from '../../../product-categories/components/product-category-lookup/product-category-lookup.component';
import { ProductBrandLookupComponent } from '../../../product-brands/components/product-brand-lookup/product-brand-lookup.component';

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
  selector: 'app-product-list',
  imports: [
    ListPageUi,
    CrudListComponent,
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: ProductService) => new CrudListFacade<Product>(service, {
        create: 'products.create',
        update: 'products.update',
        view: 'products.view',
        delete: 'products.delete'
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        ProductService
      ]
    }
  ],
  templateUrl: './product-list.page.html',
  styleUrl: './product-list.page.scss',
})
export class ProductListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<Product> = inject(CrudListFacade<Product>);

  title: WritableSignal<string> = signal<string>('Listar produtos')
  breadcrumbItems: MenuItem[] = [
    { label: 'Catálogo' },
    { label: 'Produtos' },
    { label: 'Listar', routerLink: '/catalog/products' }
  ];
  cols: TableColumn<Product>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'sku', header: 'SKU', sortable: true, type: ColumnType.Text },
    { field: 'gtin', header: 'GTIN', sortable: true, type: ColumnType.Text },
    { field: 'item_type_code', header: 'Tipo de item', sortable: true, type: ColumnType.Enum, enumOptionLabels: ItemTypeCodeLabels },
    { field: 'price', header: 'Preço', sortable: true, type: ColumnType.Currency },
    { field: 'cost', header: 'Custo', sortable: true, type: ColumnType.Currency },
    { field: 'net_weight', header: 'Peso líquido', sortable: true, type: ColumnType.Decimal, pipeArgs: ['1.2-3'] },
    { field: 'gross_weight', header: 'Peso bruto', sortable: true, type: ColumnType.Decimal, pipeArgs: ['1.2-3'] },
    { field: 'width', header: 'Altura', sortable: true, type: ColumnType.Decimal, pipeArgs: ['1.2-4'] },
    { field: 'height', header: 'Largura', sortable: true, type: ColumnType.Decimal, pipeArgs: ['1.2-4'] },
    { field: 'length', header: 'Comprimento', sortable: true, type: ColumnType.Decimal, pipeArgs: ['1.2-4'] },
    { field: 'minimum_stock', header: 'Estoque mínimo', sortable: true, type: ColumnType.Decimal, pipeArgs: ['1.2-4'] },
    { field: 'maximum_stock', header: 'Estoque máximo', sortable: true, type: ColumnType.Decimal, pipeArgs: ['1.2-4'] },
    { field: 'is_active', header: 'Ativo', sortable: true, type: ColumnType.Boolean },
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'sku', label: 'SKU', type: ColumnType.Text },
    { name: 'gtin', label: 'GTIN', type: ColumnType.Text },
    { name: 'item_type_code', label: 'Tipo de item', type: ColumnType.Enum, options: ItemTypeCodeOptions },
    { name: 'measurement_unit_id', label: 'Unidade de medida', type: ColumnType.Lookup, component: MeasurementUnitLookupComponent },
    { name: 'product_category_id', label: 'Categoria', type: ColumnType.Lookup, component: ProductCategoryLookupComponent },
    { name: 'product_brand_id', label: 'Marca', type: ColumnType.Lookup, component: ProductBrandLookupComponent },
    { name: 'description', label: 'Descrição', type: ColumnType.Text },
    { name: 'notes', label: 'Observações', type: ColumnType.Text },
    { name: 'price', label: 'Preço', type: ColumnType.Currency },
    { name: 'cost', label: 'Custo', type: ColumnType.Currency },
    { name: 'net_weight', label: 'Peso líquido', type: ColumnType.Decimal },
    { name: 'gross_weight', label: 'Peso bruto', type: ColumnType.Decimal },
    { name: 'width', label: 'Altura', type: ColumnType.Decimal },
    { name: 'height', label: 'Largura', type: ColumnType.Decimal },
    { name: 'length', label: 'Comprimento', type: ColumnType.Decimal },
    { name: 'minimum_stock', label: 'Estoque mínimo', type: ColumnType.Decimal },
    { name: 'maximum_stock', label: 'Estoque máximo', type: ColumnType.Decimal },
    { name: 'is_active', label: 'Ativo', type: ColumnType.Boolean },
  ]
  tableMenu: TableMenuItem<Product>[] = [
    {
      label: 'Visualizar',
      icon: 'pi pi-eye',
      permission: 'products.view',
      action: (record?: Product) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      permission: 'products.edit',
      action: (record?: Product) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Deletar',
      icon: 'pi pi-trash',
      permission: 'products.delete',
      action: (record?: Product) => record && this.facade.delete(record)
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
