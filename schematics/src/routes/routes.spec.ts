import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();
const MODULE_ROUTES = '/src/app/features/third-party/third-party.routes.ts';

describe('routes schematic', () => {
  it('cria as rotas do recurso e registra no módulo (dialog)', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('routes', { module: 'third-party', name: 'partner-type' }, tree);

    const routes = result.readContent('/src/app/features/third-party/partner-types/partner-types.routes.ts');
    expect(routes).toContain('export const PARTNER_TYPES_ROUTES: Routes');
    expect(routes).toContain('DynamicDialogHostComponent');
    expect(routes).toContain("permission: 'partnerTypes.create'");
    expect(routes).toContain("permission: 'partnerTypes.edit'");
    expect(routes).toContain("permission: 'partnerTypes.viewAny'");

    const moduleRoutes = result.readContent(MODULE_ROUTES);
    expect(moduleRoutes).toContain("path: 'partner-types'");
    expect(moduleRoutes).toContain("r.PARTNER_TYPES_ROUTES");
  });

  it('gera rotas de página quando --form-type=page', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'routes',
      { module: 'third-party', name: 'partner-type', 'form-type': 'page' },
      tree,
    );

    const routes = result.readContent('/src/app/features/third-party/partner-types/partner-types.routes.ts');
    expect(routes).toContain('PartnerTypeFormPage');
    expect(routes).not.toContain('DynamicDialogHostComponent');
  });

  it('é idempotente ao registrar no módulo', async () => {
    const tree = createTree();
    const first = await runner.runSchematic('routes', { module: 'third-party', name: 'partner-type' }, tree);
    const second = await runner.runSchematic('routes', { module: 'third-party', name: 'partner-type' }, first);

    const moduleRoutes = second.readContent(MODULE_ROUTES);
    expect(moduleRoutes.split("path: 'partner-types'").length - 1).toBe(1);
  });
});
