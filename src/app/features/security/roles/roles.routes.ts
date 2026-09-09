import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { RoleListPage } from './pages/role-list/role-list.page';
import { RoleFormDialog } from './pages/role-form/role-form.dialog';
import { RoleDefinePermissionsPage } from './pages/role-define-permissions/role-define-permissions.page';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';

export const ROLES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'roles.viewAny' },
        component: RoleListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'roles.create',
                    dialog: {
                        component: RoleFormDialog,
                        config: {
                            title: 'Perfil',
                            size: DialogSize.Small,
                            closeable: true
                        },
                    }
                },
                component: DynamicDialogHostComponent,
                canActivate: [permissionGuard]
            },
            {
                path: ':id/edit',
                data: {
                    permission: 'roles.edit',
                    dialog: {
                        component: RoleFormDialog,
                        config: {
                            title: 'Editar perfil',
                            size: DialogSize.Small,
                            closeable: true
                        },
                    },
                },
                component: DynamicDialogHostComponent,
                canActivate: [permissionGuard]
            },
            {
                path: ':id',
                data: {
                    permission: 'roles.view',
                    dialog: {
                        component: RoleFormDialog,
                        config: {
                            title: 'Visualizar perfil',
                            size: DialogSize.Small,
                            closeable: true
                        },
                    }
                },
                component: DynamicDialogHostComponent,
                canActivate: [permissionGuard]
            }
        ]
    },
    {
        path: ':id/permissions',
        data: { permission: 'roles.definePermissions' },
        component: RoleDefinePermissionsPage,
        canActivate: [permissionGuard]
    }
];