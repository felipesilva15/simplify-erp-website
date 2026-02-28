import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { RoleListPage } from './pages/role-list/role-list.page';
import { RoleFormPage } from './pages/role-form/role-form.page';

export const ROLES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'roles.viewAny' },
        component: RoleListPage,
        canActivate: [permissionGuard]
    },
    {
        path: ':id/edit',
        data: { permission: 'roles.edit' },
        component: RoleFormPage,
        canActivate: [permissionGuard]
    },
    {
        path: ':id',
        data: { permission: 'roles.view' },
        component: RoleFormPage,
        canActivate: [permissionGuard]
    },
    {
        path: 'new',
        data: { permission: 'roles.create' },
        component: RoleFormPage,
        canActivate: [permissionGuard]
    }
];