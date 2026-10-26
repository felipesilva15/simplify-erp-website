import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
    {
        path: 'product-categories',
        loadChildren: () => import('./product-categories/product-categories.routes').then(r => r.PRODUCT_CATEGORIES_ROUTES)
    },
    {
        path: 'product-brands',
        loadChildren: () => import('./product-brands/product-brands.routes').then(r => r.PRODUCT_BRANDS_ROUTES)
    },
    {
        path: 'measurement-units',
        loadChildren: () => import('./measurement-units/measurement-units.routes').then(r => r.MEASUREMENT_UNITS_ROUTES)
    },
    {
        path: 'products',
        loadChildren: () => import('./products/products.routes').then(r => r.PRODUCTS_ROUTES)
    }
];