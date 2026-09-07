import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { PartnerTypeListPage } from './pages/partner-type-list/partner-type-list.page';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { PartnerTypeFormDialog } from './pages/partner-type-form/partner-type-form.dialog';
import { DialogSize } from '../../../core/enums/dialog-size';

export const PARTNER_TYPES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'partnerTypes.viewAny' },
        component: PartnerTypeListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'partnerTypes.create',
                    dialog: {
                        component: PartnerTypeFormDialog,
                        config: {
                            title: 'Tipo de parceiro',
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
                    permission: 'partnerTypes.edit',
                    dialog: {
                        component: PartnerTypeFormDialog,
                        config: {
                            title: 'Editar tipo de parceiro',
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
                    permission: 'partnerTypes.view',
                    dialog: {
                        component: PartnerTypeFormDialog,
                        config: {
                            title: 'Visualizar tipo de parceiro',
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
