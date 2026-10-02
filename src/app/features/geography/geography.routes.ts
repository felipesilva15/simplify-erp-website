import { Routes } from '@angular/router';

export const GEOGRAPHY_ROUTES: Routes = [
    {
        path: 'countries',
        loadChildren: () => import('./countries/countries.routes').then(r => r.COUNTRIES_ROUTES)
    }
];