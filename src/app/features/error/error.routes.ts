import { Routes } from '@angular/router';

export const ERROR_ROUTES: Routes = [
    {
        path: ':code',
        loadComponent: () => import('./pages/error/error.page').then(c => c.ErrorPage)
    }
];