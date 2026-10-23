import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { ProductBrandListPage } from './pages/product-brand-list/product-brand-list.page';
import { ProductBrandFormDialog } from './pages/product-brand-form/product-brand-form.dialog';

export const PRODUCT_BRANDS_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'productBrands.viewAny' },
        component: ProductBrandListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'productBrands.create',
                    dialog: {
                        component: ProductBrandFormDialog,
                        config: {
                            title: 'Marca',
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
                    permission: 'productBrands.edit',
                    dialog: {
                        component: ProductBrandFormDialog,
                        config: {
                            title: 'Editar marca',
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
                    permission: 'productBrands.view',
                    dialog: {
                        component: ProductBrandFormDialog,
                        config: {
                            title: 'Visualizar marca',
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
