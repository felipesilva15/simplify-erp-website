import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { UserListPage } from './pages/user-list/user-list.page';

export const USERS_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'users.viewAny' },
        component: UserListPage,
        canActivate: [permissionGuard]
    }
];