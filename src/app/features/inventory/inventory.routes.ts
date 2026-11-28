import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
    {
        path: 'warehouses',
        loadChildren: () => import('./warehouses/warehouses.routes').then(r => r.WAREHOUSES_ROUTES)
    }
];
