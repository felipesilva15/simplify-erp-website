import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { DialogSize } from '../../../core/enums/dialog-size';
import { DynamicDialogHostComponent } from '../../../shared/components/dynamic-dialog-host/dynamic-dialog-host.component';
import { FinanceCategoryListPage } from './pages/finance-category-list/finance-category-list.page';
import { FinanceCategoryFormDialog } from './pages/finance-category-form/finance-category-form.dialog';

export const FINANCE_CATEGORIES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'financeCategories.viewAny' },
        component: FinanceCategoryListPage,
        canActivate: [permissionGuard],
        children: [
            {
                path: 'new',
                data: {
                    permission: 'financeCategories.create',
                    dialog: {
                        component: FinanceCategoryFormDialog,
                        config: {
                            title: 'Categoria',
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
                    permission: 'financeCategories.edit',
                    dialog: {
                        component: FinanceCategoryFormDialog,
                        config: {
                            title: 'Editar categoria',
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
                    permission: 'financeCategories.view',
                    dialog: {
                        component: FinanceCategoryFormDialog,
                        config: {
                            title: 'Visualizar categoria',
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
