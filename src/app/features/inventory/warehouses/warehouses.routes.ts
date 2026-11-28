import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { WarehouseListPage } from './pages/warehouse-list/warehouse-list.page';
import { WarehouseFormDialog } from './pages/warehouse-form/warehouse-form.dialog';

export const WAREHOUSES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'warehouses.viewAny' },
        component: WarehouseListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'warehouses.create',
                    dialog: {
                        component: WarehouseFormDialog,
                        config: {
                            title: 'Armazém',
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
                    permission: 'warehouses.edit',
                    dialog: {
                        component: WarehouseFormDialog,
                        config: {
                            title: 'Editar armazém',
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
                    permission: 'warehouses.view',
                    dialog: {
                        component: WarehouseFormDialog,
                        config: {
                            title: 'Visualizar armazém',
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
