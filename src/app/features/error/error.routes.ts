import { Routes } from '@angular/router';

export const ERROR_ROUTES: Routes = [
    {
        path: '403',
        loadComponent: () => import('./pages/forbidden/forbidden.component').then(c => c.ForbiddenComponent)
    },
    {
        path: '404',
        loadComponent: () => import('./pages/not-found/not-found.component').then(c => c.NotFoundComponent)
    }
];