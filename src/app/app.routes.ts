import { Routes } from '@angular/router';
import { MainLayout } from './layouts/pages/main/main.layout';
import { appStartupGuard } from './core/guards/app-startup-guard';
import { ErrorLayout } from './layouts/pages/error/error.layout';

export const routes: Routes = [
    {
        path: 'security/auth',
        loadChildren: () => import('./features/security/auth/auth.routes').then(r => r.AUTH_ROUTES)
    },
    {
        path: '',
        component: MainLayout,
        canActivate: [appStartupGuard],
        children: [
            {
                path: 'security',
                loadChildren: () => import('./features/security/security.routes').then(r => r.SECURITY_ROUTES) 
            },
        ],
    },
    {
        path: 'error',
        component: ErrorLayout,
        children: [
            {
                path: '',
                loadChildren: () => import('./features/error/error.routes').then(r => r.ERROR_ROUTES) 
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'error/404'
    }
];
