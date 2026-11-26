import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { PaymentMethodListPage } from './pages/payment-method-list/payment-method-list.page';
import { PaymentMethodFormDialog } from './pages/payment-method-form/payment-method-form.dialog';

export const PAYMENT_METHODS_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'paymentMethods.viewAny' },
        component: PaymentMethodListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'paymentMethods.create',
                    dialog: {
                        component: PaymentMethodFormDialog,
                        config: {
                            title: 'Método de pagamento',
                            size: DialogSize.Medium,
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
                    permission: 'paymentMethods.edit',
                    dialog: {
                        component: PaymentMethodFormDialog,
                        config: {
                            title: 'Editar método de pagamento',
                            size: DialogSize.Medium,
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
                    permission: 'paymentMethods.view',
                    dialog: {
                        component: PaymentMethodFormDialog,
                        config: {
                            title: 'Visualizar método de pagamento',
                            size: DialogSize.Medium,
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
