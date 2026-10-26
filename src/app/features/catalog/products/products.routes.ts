import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { ProductListPage } from './pages/product-list/product-list.page';
import { ProductFormPage } from './pages/product-form/product-form.page';

export const PRODUCTS_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'products.viewAny' },
        component: ProductListPage,
        canActivate: [permissionGuard]
    },
    {
        path: 'new',
        data: { permission: 'products.create' },
        component: ProductFormPage,
        canActivate: [permissionGuard]
    },
    {
        path: ':id/edit',
        data: { permission: 'products.edit' },
        component: ProductFormPage,
        canActivate: [permissionGuard]
    },
    {
        path: ':id',
        data: { permission: 'products.view' },
        component: ProductFormPage,
        canActivate: [permissionGuard]
    }
];
