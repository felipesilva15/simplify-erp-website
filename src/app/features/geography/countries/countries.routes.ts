import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { CountryListPage } from './pages/country-list/country-list.page';
import { CountryFormDialog } from './pages/country-form/country-form.dialog';

export const COUNTRIES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'countries.viewAny' },
        component: CountryListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: ':id',
                data: {
                    permission: 'countries.view',
                    dialog: {
                        component: CountryFormDialog,
                        config: {
                            title: 'Visualizar país',
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