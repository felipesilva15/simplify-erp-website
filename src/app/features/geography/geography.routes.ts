import { Routes } from '@angular/router';

export const GEOGRAPHY_ROUTES: Routes = [
    {
        path: 'countries',
        loadChildren: () => import('./countries/countries.routes').then(r => r.COUNTRIES_ROUTES)
    },
    {
        path: 'states',
        loadChildren: () => import('./states/states.routes').then(r => r.STATES_ROUTES)
    }
];