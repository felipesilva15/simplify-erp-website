import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { CityFormDialog } from './pages/city-form/city-form.dialog';
import { CityListPage } from './pages/city-list/city-list.page';

export const CITIES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'cities.viewAny' },
        component: CityListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: ':id',
                data: {
                    permission: 'cities.view',
                    dialog: {
                        component: CityFormDialog,
                        config: {
                            title: 'Visualizar cidade',
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