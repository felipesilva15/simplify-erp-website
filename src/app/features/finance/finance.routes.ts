import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
    {
        path: 'payment-methods',
        loadChildren: () => import('./payment-methods/payment-methods.routes').then(r => r.PAYMENT_METHODS_ROUTES)
    }
];
