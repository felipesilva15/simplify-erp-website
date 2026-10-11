import { describe, expect, it } from 'vitest';
import { createRunner, createTree, resourceDir } from '../testing/helpers';

const runner = createRunner();

describe('crud schematic', () => {
  it('gera o CRUD completo (dialog) com os artefatos esperados', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      {
        module: 'third-party',
        name: 'partner-type',
        fields: 'name:string:Nome,active:boolean:Ativo',
      },
      tree,
    );

    const dir = resourceDir('third-party', 'partner-types');

    expect(result.exists(`${dir}/models/partner-type.ts`)).toBe(true);
    expect(result.exists(`${dir}/services/partner-type-service.ts`)).toBe(true);
    expect(result.exists(`${dir}/services/partner-type-service.spec.ts`)).toBe(true);
    expect(result.exists(`${dir}/components/partner-type-lookup/partner-type-lookup.component.ts`)).toBe(true);
    expect(result.exists(`${dir}/pages/partner-type-list/partner-type-list.page.ts`)).toBe(true);
    expect(result.exists(`${dir}/pages/partner-type-list/partner-type-list.page.html`)).toBe(true);
    expect(result.exists(`${dir}/pages/partner-type-list/partner-type-list.page.spec.ts`)).toBe(true);
    expect(result.exists(`${dir}/pages/partner-type-form/partner-type-form.dialog.ts`)).toBe(true);
    expect(result.exists(`${dir}/pages/partner-type-form/partner-type-form.dialog.html`)).toBe(true);
    expect(result.exists(`${dir}/pages/partner-type-form/partner-type-form.dialog.spec.ts`)).toBe(true);
    expect(result.exists(`${dir}/partner-types.routes.ts`)).toBe(true);
  });

  it('deriva nomes de classe, permissões e caminhos corretamente', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type' },
      tree,
    );

    const model = result.readContent('/src/app/features/third-party/partner-types/models/partner-type.ts');
    expect(model).toContain('export interface PartnerType extends BaseEntity');
    expect(model).toContain('name: string;');

    const list = result.readContent(
      '/src/app/features/third-party/partner-types/pages/partner-type-list/partner-type-list.page.ts',
    );
    expect(list).toContain('export class PartnerTypeListPage');
    expect(list).toContain("create: 'partnerTypes.create'");
    expect(list).toContain("update: 'partnerTypes.update'");
    expect(list).toContain("permission: 'partnerTypes.edit'");
    expect(list).toContain("routerLink: '/third-party/partner-types'");

    const service = result.readContent(
      '/src/app/features/third-party/partner-types/services/partner-type-service.ts',
    );
    expect(service).toContain("environment.baseUrlApi + '/third-party/partner-types'");

    const routes = result.readContent('/src/app/features/third-party/partner-types/partner-types.routes.ts');
    expect(routes).toContain('export const PARTNER_TYPES_ROUTES: Routes');
    expect(routes).toContain("permission: 'partnerTypes.viewAny'");
  });

  it('registra a rota no módulo e a entrada no menu', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type' },
      tree,
    );

    const moduleRoutes = result.readContent('/src/app/features/third-party/third-party.routes.ts');
    expect(moduleRoutes).toContain("path: 'partner-types'");
    expect(moduleRoutes).toContain('r.PARTNER_TYPES_ROUTES');

    const menu = result.readContent('/src/app/core/config/menu.ts');
    expect(menu).toContain("link: '/third-party/partner-types'");
    expect(menu).toContain("permission: 'partnerTypes.viewAny'");
    expect(menu).toContain("label: 'Partner types'");
  });

  it('usa os rótulos pt-BR informados nas opções', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      {
        module: 'third-party',
        name: 'partner-type',
        label: 'Tipo de parceiro',
        'label-plural': 'Tipos de parceiro',
      },
      tree,
    );

    const menu = result.readContent('/src/app/core/config/menu.ts');
    expect(menu).toContain("label: 'Tipos de parceiro'");

    const list = result.readContent(
      '/src/app/features/third-party/partner-types/pages/partner-type-list/partner-type-list.page.ts',
    );
    expect(list).toContain("signal<string>('Listar tipos de parceiro')");
  });

  it('é idempotente: rodar duas vezes não duplica menu nem rotas', async () => {
    const tree = createTree();
    const first = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type' },
      tree,
    );
    const second = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type' },
      first,
    );

    const menu = second.readContent('/src/app/core/config/menu.ts');
    const occurrences = menu.split("link: '/third-party/partner-types'").length - 1;
    expect(occurrences).toBe(1);

    const moduleRoutes = second.readContent('/src/app/features/third-party/third-party.routes.ts');
    const routeOccurrences = moduleRoutes.split("path: 'partner-types'").length - 1;
    expect(routeOccurrences).toBe(1);
  });

  it('preserva arquivos existentes sem --force', async () => {
    const tree = createTree();
    tree.create(
      '/src/app/features/third-party/partner-types/models/partner-type.ts',
      '// arquivo customizado\n',
    );

    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type' },
      tree,
    );

    expect(result.readContent('/src/app/features/third-party/partner-types/models/partner-type.ts')).toBe(
      '// arquivo customizado\n',
    );
  });

  it('sobrescreve arquivos existentes com --force', async () => {
    const tree = createTree();
    tree.create(
      '/src/app/features/third-party/partner-types/models/partner-type.ts',
      '// arquivo customizado\n',
    );

    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type', force: true },
      tree,
    );

    expect(result.readContent('/src/app/features/third-party/partner-types/models/partner-type.ts')).toContain(
      'export interface PartnerType',
    );
  });

  it('gera formulário como página quando --form-type=page', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type', 'form-type': 'page' },
      tree,
    );

    const dir = resourceDir('third-party', 'partner-types');
    expect(result.exists(`${dir}/pages/partner-type-form/partner-type-form.page.ts`)).toBe(true);
    expect(result.exists(`${dir}/pages/partner-type-form/partner-type-form.dialog.ts`)).toBe(false);

    const routes = result.readContent(`${dir}/partner-types.routes.ts`);
    expect(routes).toContain('PartnerTypeFormPage');
    expect(routes).not.toContain('DynamicDialogHostComponent');

    const listHtml = result.readContent(`${dir}/pages/partner-type-list/partner-type-list.page.html`);
    expect(listHtml).not.toContain('<router-outlet />');
  });

  it('inclui exportação na listagem com --with-export', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type', 'with-export': true },
      tree,
    );

    const list = result.readContent(
      '/src/app/features/third-party/partner-types/pages/partner-type-list/partner-type-list.page.ts',
    );
    expect(list).toContain('const exportMenu: ExportMenuItem[] = [');
    expect(list).toContain('exportMenu: exportMenu');
    expect(list).toContain("import { ExportFormat } from '../../../../../core/enums/export-format';");
  });

  it('respeita --skip-menu, --skip-routes, --skip-lookup e --skip-tests', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      {
        module: 'third-party',
        name: 'partner-type',
        'skip-menu': true,
        'skip-routes': true,
        'skip-lookup': true,
        'skip-tests': true,
      },
      tree,
    );

    const dir = resourceDir('third-party', 'partner-types');
    expect(result.exists(`${dir}/partner-types.routes.ts`)).toBe(false);
    expect(result.exists(`${dir}/components/partner-type-lookup/partner-type-lookup.component.ts`)).toBe(false);
    expect(result.exists(`${dir}/services/partner-type-service.spec.ts`)).toBe(false);

    const moduleRoutes = result.readContent('/src/app/features/third-party/third-party.routes.ts');
    expect(moduleRoutes).not.toContain('partner-types');

    const menu = result.readContent('/src/app/core/config/menu.ts');
    expect(menu).not.toContain("link: '/third-party/partner-types'");
  });

  it('falha com mensagem clara para módulo inexistente', async () => {
    const tree = createTree();
    await expect(
      runner.runSchematic('crud', { module: 'nao-existe', name: 'partner-type' }, tree),
    ).rejects.toThrow(/Módulo "nao-existe" não encontrado/);
  });

  it('falha com mensagem clara para nome inválido', async () => {
    const tree = createTree();
    await expect(
      runner.runSchematic('crud', { module: 'third-party', name: 'partner_type!' }, tree),
    ).rejects.toThrow(/Nome de recurso inválido/);
  });
});
