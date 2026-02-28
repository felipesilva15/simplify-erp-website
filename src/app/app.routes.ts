import { Routes } from '@angular/router';
import { MainLayout } from './layouts/pages/main/main.layout';
import { permissionGuard } from './core/guards/permission-guard';

export const routes: Routes = [
    {
        path: 'security/auth',
        loadChildren: () => import('./features/security/auth/auth.routes').then(r => r.AUTH_ROUTES)
    },
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: 'security/roles',
                data: { permission: 'roles.viewAny' },
                loadComponent: () => import('./features/security/roles/pages/role-list/role-list.page').then(p => p.RoleListPage),
                canActivate: [permissionGuard]
            }
        ],
    }
];
