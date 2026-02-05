import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'security/auth',
        loadChildren: () => import('./features/security/auth/auth.routes').then(r => r.AUTH_ROUTES)
    }
];
