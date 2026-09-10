import { Routes } from '@angular/router';
import { PartnerListPage } from './pages/partner-list/partner-list.page';
import { permissionGuard } from '../../../core/guards/permission-guard';

export const PARTNER_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'partners.viewAny' },
        component: PartnerListPage,
        canActivate: [permissionGuard],
    }
];
