import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { StateListPage } from './pages/state-list/state-list.page';
import { StateFormDialog } from './pages/state-form/state-form.dialog';

export const STATES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'states.viewAny' },
        component: StateListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: ':id',
                data: {
                    permission: 'states.view',
                    dialog: {
                        component: StateFormDialog,
                        config: {
                            title: 'Visualizar estado',
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