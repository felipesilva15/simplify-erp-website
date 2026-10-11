import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();

describe('module schematic', () => {
  it('cria o arquivo de rotas, registra no app.routes e adiciona grupo de menu vazio', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('module', { name: 'sales' }, tree);

    const routesPath = '/src/app/features/sales/sales.routes.ts';
    expect(result.exists(routesPath)).toBe(true);

    const routes = result.readContent(routesPath);
    expect(routes).toContain('export const SALES_ROUTES: Routes = [');
    expect(routes).toContain('];');

    const appRoutes = result.readContent('/src/app/app.routes.ts');
    expect(appRoutes).toContain("path: 'sales'");
    expect(appRoutes).toContain("import('./features/sales/sales.routes').then(r => r.SALES_ROUTES)");

    const menu = result.readContent('/src/app/core/config/menu.ts');
    expect(menu).toContain("label: 'Sales'");
    expect(menu).toContain('items: []');
  });

  it('usa o rótulo derivado do mapa para módulos conhecidos', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('module', { name: 'catalog' }, tree);

    const menu = result.readContent('/src/app/core/config/menu.ts');
    expect(menu).toContain("label: 'Catálogo'");
  });

  it('é idempotente e não duplica registros', async () => {
    const tree = createTree();
    const first = await runner.runSchematic('module', { name: 'sales' }, tree);
    const result = await runner.runSchematic('module', { name: 'sales' }, first);

    const appRoutes = result.readContent('/src/app/app.routes.ts');
    const occurrences = appRoutes.split("path: 'sales'").length - 1;
    expect(occurrences).toBe(1);

    const menu = result.readContent('/src/app/core/config/menu.ts');
    const menuOccurrences = menu.split("label: 'Sales'").length - 1;
    expect(menuOccurrences).toBe(1);
  });

  it('permite pular rotas e menu', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'module',
      { name: 'sales', 'skip-routes': true, 'skip-menu': true },
      tree,
    );

    expect(result.exists('/src/app/features/sales/sales.routes.ts')).toBe(true);

    const appRoutes = result.readContent('/src/app/app.routes.ts');
    expect(appRoutes).not.toContain("path: 'sales'");

    const menu = result.readContent('/src/app/core/config/menu.ts');
    expect(menu).not.toContain("label: 'Sales'");
  });

  it('gera rotas de recurso em um array vazio sem vírgula sobrando', async () => {
    const tree = createTree();
    const withModule = await runner.runSchematic('module', { name: 'sales' }, tree);
    const result = await runner.runSchematic(
      'crud',
      { module: 'sales', name: 'customer', fields: 'name:string:Nome' },
      withModule,
    );

    const routes = result.readContent('/src/app/features/sales/sales.routes.ts');
    expect(routes).toContain("path: 'customers',");
    expect(routes).not.toContain(',\n];');
    expect(routes).not.toMatch(/,\s*\]/);
  });
});
