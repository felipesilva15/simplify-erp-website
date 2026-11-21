import { Routes } from '@angular/router';

export const CONSTRUCTION_ROUTES: Routes = [
    {
        path: 'project-types',
        loadChildren: () => import('./project-types/project-types.routes').then(r => r.PROJECT_TYPES_ROUTES)
    }
];
