import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { RoleListPage } from './pages/role-list/role-list.page';
import { RoleFormPage } from './pages/role-form/role-form.page';
import { RoleDefinePermissionsPage } from './pages/role-define-permissions/role-define-permissions.page';

export const ROLES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'roles.viewAny' },
        component: RoleListPage,
        canActivate: [permissionGuard]
    },
    {
        path: 'new',
        data: { permission: 'roles.create' },
        component: RoleFormPage,
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
        path: ':id/permissions',
        data: { permission: 'roles.definePermissions' },
        component: RoleDefinePermissionsPage,
        canActivate: [permissionGuard]
    }
];