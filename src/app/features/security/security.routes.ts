import { Routes } from '@angular/router';

export const SECURITY_ROUTES: Routes = [
    {
        path: 'roles',
        loadChildren: () => import('./roles/roles.routes').then(r => r.ROLES_ROUTES)
    }
];