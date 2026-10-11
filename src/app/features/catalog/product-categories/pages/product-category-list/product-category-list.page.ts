import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ColumnType } from '../../../../../core/enums/column-type';
import { FilterFieldDefinition } from '../../../../../core/models/filter-field-definition';
import { TableColumn } from '../../../../../core/models/table-column';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { CrudListComponent } from '../../../../../shared/components/crud-list/crud-list.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { ListPageUi } from '../../../../../shared/ui/list-page/list-page.ui';
import { ProductCategory } from '../../models/product-category';
import { ProductCategoryService } from '../../services/product-category-service';
import { ProductApplicabilityLabels, ProductApplicabilityOptions } from '../../enums/product-applicability';

@Component({
  selector: 'app-product-category-list',
  imports: [
    ListPageUi,
    CrudListComponent,
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: ProductCategoryService) => new CrudListFacade<ProductCategory>(service, {
        create: 'productCategories.create',
        update: 'productCategories.update',
        view: 'productCategories.view',
        delete: 'productCategories.delete'
      }),
      deps: [
        ProductCategoryService
      ]
    }
  ],
  templateUrl: './product-category-list.page.html',
  styleUrl: './product-category-list.page.scss',
})
export class ProductCategoryListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<ProductCategory> = inject(CrudListFacade<ProductCategory>);

  title: WritableSignal<string> = signal<string>('Listar categorias')
  breadcrumbItems: MenuItem[] = [
    { label: 'Catálogo' },
    { label: 'Categorias' },
    { label: 'Listar', routerLink: '/catalog/product-categories' }
  ];
  cols: TableColumn<ProductCategory>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'applicability', header: 'Aplicabilidade', sortable: true, type: ColumnType.Enum, enumOptionLabels: ProductApplicabilityLabels },
    { field: 'is_active', header: 'Ativo', sortable: true, type: ColumnType.Boolean },
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'parent_category_id', label: 'CategoriaPai', type: ColumnType.Decimal },
    { name: 'applicability', label: 'Aplicabilidade', type: ColumnType.Enum, options: ProductApplicabilityOptions },
    { name: 'is_active', label: 'Ativo', type: ColumnType.Boolean },
  ]
  tableMenu: TableMenuItem<ProductCategory>[] = [
    {
      label: 'Visualizar',
      icon: 'pi pi-eye',
      permission: 'productCategories.view',
      action: (record?: ProductCategory) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      permission: 'productCategories.edit',
      action: (record?: ProductCategory) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Deletar',
      icon: 'pi pi-trash',
      permission: 'productCategories.delete',
      action: (record?: ProductCategory) => record && this.facade.delete(record)
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
