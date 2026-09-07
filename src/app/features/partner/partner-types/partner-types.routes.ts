import { Routes } from '@angular/router';
import { permissionGuard } from '../../../core/guards/permission-guard';
import { PartnerTypeListPage } from './pages/partner-type-list/partner-type-list.page';

export const PARTNER_TYPES_ROUTES: Routes = [
    {
        path: '',
        data: { permission: 'partnerTypes.viewAny' },
        component: PartnerTypeListPage,
        canActivate: [permissionGuard]
    }
];
