import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { MeasurementUnitListPage } from './pages/measurement-unit-list/measurement-unit-list.page';
import { MeasurementUnitFormDialog } from './pages/measurement-unit-form/measurement-unit-form.dialog';

export const MEASUREMENT_UNITS_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'measurementUnits.viewAny' },
        component: MeasurementUnitListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'measurementUnits.create',
                    dialog: {
                        component: MeasurementUnitFormDialog,
                        config: {
                            title: 'Unidade de medida',
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
                    permission: 'measurementUnits.edit',
                    dialog: {
                        component: MeasurementUnitFormDialog,
                        config: {
                            title: 'Editar unidade de medida',
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
                    permission: 'measurementUnits.view',
                    dialog: {
                        component: MeasurementUnitFormDialog,
                        config: {
                            title: 'Visualizar unidade de medida',
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
