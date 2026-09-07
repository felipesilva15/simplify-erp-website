import { Routes } from '@angular/router';

export const PARTNER_ROUTES: Routes = [
    {
        path: 'partner-types',
        loadChildren: () => import('./partner-types/partner-types.routes').then(r => r.PARTNER_TYPES_ROUTES)
    }
];