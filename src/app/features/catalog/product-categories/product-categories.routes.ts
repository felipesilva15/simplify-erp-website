import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { ProductCategoryListPage } from './pages/product-category-list/product-category-list.page';
import { ProductCategoryFormDialog } from './pages/product-category-form/product-category-form.dialog';

export const PRODUCT_CATEGORIES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'productCategories.viewAny' },
        component: ProductCategoryListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'productCategories.create',
                    dialog: {
                        component: ProductCategoryFormDialog,
                        config: {
                            title: 'Categoria',
                            size: DialogSize.Small,
                            closeable: true
                        },
                    }
                },
                component: DynamicDialogHostComponent,
                canActivate: [permissionGuard]
            },
            {
                path: ':id/edit',
                data: {
                    permission: 'productCategories.edit',
                    dialog: {
                        component: ProductCategoryFormDialog,
                        config: {
                            title: 'Editar categoria',
                            size: DialogSize.Small,
                            closeable: true
                        },
                    },
                },
                component: DynamicDialogHostComponent,
                canActivate: [permissionGuard]
            },
            {
                path: ':id',
                data: {
                    permission: 'productCategories.view',
                    dialog: {
                        component: ProductCategoryFormDialog,
                        config: {
                            title: 'Visualizar categoria',
                            size: DialogSize.Small,
                            closeable: true
                        },
                    }
                },
                component: DynamicDialogHostComponent,
                canActivate: [permissionGuard]
            }
        ]
    }
];
