import { Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
    {
        path: 'professions',
        loadChildren: () => import('./professions/professions.routes').then(r => r.PROFESSIONS_ROUTES)
    }
];