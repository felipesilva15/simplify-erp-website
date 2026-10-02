import { Routes } from '@angular/router';
import { ProfessionListPage } from './pages/profession-list/profession-list.page';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { ProfessionFormDialog } from './pages/profession-form/profession-form.dialog';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';

export const PROFESSIONS_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'professions.viewAny' },
        component: ProfessionListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: ':id',
                data: {
                    permission: 'professions.view',
                    dialog: {
                        component: ProfessionFormDialog,
                        config: {
                            title: 'Visualizar profissão',
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