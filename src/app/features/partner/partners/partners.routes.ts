import { Routes } from '@angular/router';
import { PartnerListPage } from './pages/partner-list/partner-list.page';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { PartnerFormPage } from './pages/partner-form/partner-form.page';

export const PARTNER_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'partners.viewAny' },
        component: PartnerListPage,
        canActivate: [permissionGuard],
    },
    {
        path: 'new',
        data: { permission: 'partners.create' },
        component: PartnerFormPage,
        canActivate: [permissionGuard]
    },
    {
        path: ':id/edit',
        data: { permission: 'partners.edit' },
        component: PartnerFormPage,
        canActivate: [permissionGuard]
    },
    {
        path: ':id',
        data: { permission: 'partners.view' },
        component: PartnerFormPage,
        canActivate: [permissionGuard]
    }
];
