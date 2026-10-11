import { HostTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { join } from 'node:path';

const COLLECTION_PATH = join(process.cwd(), 'collection.json');

/** Cria um runner apontando para a collection local. */
export function createRunner(): SchematicTestRunner {
  return new SchematicTestRunner('@simplify-erp/schematics', COLLECTION_PATH);
}

const MODULE_ROUTES = `import { Routes } from '@angular/router';

export const THIRD_PARTY_ROUTES: Routes = [
    {
        path: 'partners',
        loadChildren: () => import('./partners/partners.routes').then(r => r.PARTNERS_ROUTES)
    }
];
`;

const APP_ROUTES = `import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: 'third-party',
                loadChildren: () => import('./features/third-party/third-party.routes').then(r => r.THIRD_PARTY_ROUTES)
            }
        ]
    }
];
`;

const MENU = `import { AppMenuItem } from "../models/app-menu-item";

export const MENU: AppMenuItem[] = [
  {
    label: 'Terceiro',
    icon: 'pi pi-folder',
    active: false,
    items: [
      {
        label: 'Parceiros',
        icon: 'pi pi-user',
        active: false,
        link: '/third-party/partners',
        permission: 'partners.viewAny'
      }
    ]
  },
  {
    separator: true
  }
];
`;

/** Árvore virtual com o mínimo do workspace para os schematics rodarem. */
export function createTree(): UnitTestTree {
  const tree = new UnitTestTree(new HostTree());

  tree.create('/angular.json', JSON.stringify({ projects: { app: { sourceRoot: 'src' } } }));
  tree.create('/src/app/features/third-party/third-party.routes.ts', MODULE_ROUTES);
  tree.create('/src/app/app.routes.ts', APP_ROUTES);
  tree.create('/src/app/core/config/menu.ts', MENU);

  return tree;
}

/** Caminho base de um recurso gerado. */
export function resourceDir(module: string, resource: string): string {
  return `/src/app/features/${module}/${resource}`;
}
