import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { ProjectTypeListPage } from './pages/project-type-list/project-type-list.page';
import { ProjectTypeFormDialog } from './pages/project-type-form/project-type-form.dialog';

export const PROJECT_TYPES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'projectTypes.viewAny' },
        component: ProjectTypeListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'projectTypes.create',
                    dialog: {
                        component: ProjectTypeFormDialog,
                        config: {
                            title: 'Tipo de projeto',
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
                    permission: 'projectTypes.edit',
                    dialog: {
                        component: ProjectTypeFormDialog,
                        config: {
                            title: 'Editar tipo de projeto',
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
                    permission: 'projectTypes.view',
                    dialog: {
                        component: ProjectTypeFormDialog,
                        config: {
                            title: 'Visualizar tipo de projeto',
                            size: DialogSize.Small,
                            closeable: true
                        },
                    }
                },
                component: DynamicDialogHostComponent,
                canActivate: [permissionGuard]
            }
        ]
    }
];
