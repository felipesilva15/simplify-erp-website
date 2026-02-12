import { Routes } from '@angular/router';
import { MainLayout } from './layouts/pages/main/main.layout';

export const routes: Routes = [
    {
        path: 'security/auth',
        loadChildren: () => import('./features/security/auth/auth.routes').then(r => r.AUTH_ROUTES)
    },
    {
        path: '',
        component: MainLayout,
        children: []
    }
];
