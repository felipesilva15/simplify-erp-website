import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
    {
        path: 'product-categories',
        loadChildren: () => import('./product-categories/product-categories.routes').then(r => r.PRODUCT_CATEGORIES_ROUTES)
    }
];