import { Routes } from '@angular/router';

export const PARTNER_ROUTES: Routes = [
    {
        path: 'partners',
        loadChildren: () => import('./partners/partners.routes').then(r => r.PARTNER_ROUTES)
    },
    {
        path: 'partner-types',
        loadChildren: () => import('./partner-types/partner-types.routes').then(r => r.PARTNER_TYPES_ROUTES)
    }
];