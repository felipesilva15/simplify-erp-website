import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { UserListPage } from './pages/user-list/user-list.page';
import { UserFormPage } from './pages/user-form/user-form.page';

export const USERS_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'users.viewAny' },
        component: UserListPage,
        canActivate: [permissionGuard]
    },
    {
        path: 'new',
        data: { permission: 'users.create' },
        component: UserFormPage,
        canActivate: [permissionGuard]
    },
    {
        path: ':id/edit',
        data: { permission: 'users.edit' },
        component: UserFormPage,
        canActivate: [permissionGuard]
    },
    {
        path: ':id',
        data: { permission: 'users.view' },
        component: UserFormPage,
        canActivate: [permissionGuard]
    }
];