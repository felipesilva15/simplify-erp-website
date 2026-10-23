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

  it('repassa --with-log ao service e implementa LogableService', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type', 'with-log': true, 'with-export': true },
      tree,
    );

    const service = result.readContent(
      '/src/app/features/third-party/partner-types/services/partner-type-service.ts',
    );
    expect(service).toContain(
      'export class PartnerTypeService implements CrudService<PartnerType>, LookupService, LogableService, ExportableService',
    );
    expect(service).toContain('activityLogs(id: number, params?: ListRequestParams)');
  });

  it('inclui exportação na listagem com --with-export', async () => {    const tree = createTree();
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

  it('gera enum, importa no model e liga em list/form', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      {
        module: 'catalog',
        name: 'product-category',
        fields:
          'name:string:Nome,applicability:enum:Aplicabilidade:ProductApplicability:PRODUCT=Produtos|SERVICE=Serviços|BOTH=Ambos',
      },
      tree,
    );

    const dir = resourceDir('catalog', 'product-categories');

    expect(result.exists(`${dir}/enums/product-applicability.ts`)).toBe(true);

    const enumFile = result.readContent(`${dir}/enums/product-applicability.ts`);
    expect(enumFile).toContain('export enum ProductApplicability {');
    expect(enumFile).toContain("Product = 'PRODUCT',");
    expect(enumFile).toContain("[ProductApplicability.Product]: 'Produtos',");

    const model = result.readContent(`${dir}/models/product-category.ts`);
    expect(model).toContain("import { ProductApplicability } from '../enums/product-applicability';");
    expect(model).toContain('applicability: ProductApplicability;');

    const list = result.readContent(`${dir}/pages/product-category-list/product-category-list.page.ts`);
    expect(list).toContain(
      "import { ProductApplicabilityLabels, ProductApplicabilityOptions } from '../../enums/product-applicability';",
    );
    expect(list).toContain('type: ColumnType.Enum, enumOptionLabels: ProductApplicabilityLabels');
    expect(list).toContain('type: ColumnType.Enum, options: ProductApplicabilityOptions');

    const form = result.readContent(`${dir}/pages/product-category-form/product-category-form.dialog.ts`);
    expect(form).toContain("import { SelectModule } from 'primeng/select';");
    expect(form).toContain(
      "import { ProductApplicability, ProductApplicabilityOptions } from '../../enums/product-applicability';",
    );
    expect(form).toContain(
      'productApplicabilityOptions: { code: ProductApplicability, name: string }[] = ProductApplicabilityOptions;',
    );
    expect(form).toContain('applicability: [ProductApplicability.Product, [Validators.required]]');

    const formHtml = result.readContent(`${dir}/pages/product-category-form/product-category-form.dialog.html`);
    expect(formHtml).toContain('formControlName="applicability"');
    expect(formHtml).toContain('[options]="productApplicabilityOptions"');
  });

  it('trata campos terminados em _id como lookup (same-module) e não os coloca em cols', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      {
        module: 'third-party',
        name: 'partner',
        fields: 'name:string:Nome,state_id:number:Estado:geography,city:string:Cidade',
      },
      tree,
    );

    const dir = resourceDir('third-party', 'partners');

    const model = result.readContent(`${dir}/models/partner.ts`);
    expect(model).toContain('state_id: number;');

    const list = result.readContent(`${dir}/pages/partner-list/partner-list.page.ts`);
    expect(list).toContain("import { StateLookupComponent } from '../../../../../features/geography/states/components/state-lookup/state-lookup.component';");
    expect(list).toContain(
      "{ name: 'state_id', label: 'Estado', type: ColumnType.Lookup, component: StateLookupComponent },",
    );
    expect(list).not.toContain("{ field: 'state_id'");

    const form = result.readContent(`${dir}/pages/partner-form/partner-form.dialog.ts`);
    expect(form).toContain("import { LookupItem } from '../../../../../core/models/lookup-item';");
    expect(form).toContain('state_id: new FormControl<LookupItem | null>(null, [Validators.required])');
    expect(form).toContain('StateLookupComponent');

    const formHtml = result.readContent(`${dir}/pages/partner-form/partner-form.dialog.html`);
    expect(formHtml).toContain('<app-state-lookup formControlName="state_id"></app-state-lookup>');
  });

  it('resolve lookup para o próprio recurso (self reference)', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      {
        module: 'catalog',
        name: 'product-category',
        fields: 'name:string:Nome,parent_category_id:number:Categoria pai::product-category',
      },
      tree,
    );

    const dir = resourceDir('catalog', 'product-categories');
    const form = result.readContent(`${dir}/pages/product-category-form/product-category-form.dialog.ts`);
    expect(form).toContain(
      "import { ProductCategoryLookupComponent } from '../../components/product-category-lookup/product-category-lookup.component';",
    );

    const formHtml = result.readContent(`${dir}/pages/product-category-form/product-category-form.dialog.html`);
    expect(formHtml).toContain('<app-product-category-lookup formControlName="parent_category_id"></app-product-category-lookup>');
  });

  it('marca campos opcionais com ? no model e sem Validators.required no form', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner-type', fields: 'name?:string:Nome,active:boolean:Ativo' },
      tree,
    );

    const dir = resourceDir('third-party', 'partner-types');
    const model = result.readContent(`${dir}/models/partner-type.ts`);
    expect(model).toContain('name?: string;');

    const form = result.readContent(`${dir}/pages/partner-type-form/partner-type-form.dialog.ts`);
    expect(form).toContain("name: ['', [Validators.maxLength(255)]]");
    expect(form).not.toContain("name: ['', [Validators.required");
  });

  it('permite sobrescrever o placeholder de busca', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      {
        module: 'third-party',
        name: 'partner-type',
        fields: 'name:string:Nome',
        placeholder: 'Buscar por nome do parceiro',
      },
      tree,
    );

    const listHtml = result.readContent(
      '/src/app/features/third-party/partner-types/pages/partner-type-list/partner-type-list.page.html',
    );
    expect(listHtml).toContain("[searchPlaceholder]=\"'Buscar por nome do parceiro'\"");

    const lookupHtml = result.readContent(
      '/src/app/features/third-party/partner-types/components/partner-type-lookup/partner-type-lookup.component.html',
    );
    expect(lookupHtml).toContain('placeholder="Buscar por nome do parceiro"');
  });

  it('mantém campos _id como number quando --detect-lookups=false', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'crud',
      { module: 'third-party', name: 'partner', fields: 'name:string:Nome,state_id:number:Estado', 'detect-lookups': false },
      tree,
    );

    const dir = resourceDir('third-party', 'partners');
    const list = result.readContent(`${dir}/pages/partner-list/partner-list.page.ts`);
    expect(list).toContain("{ field: 'state_id', header: 'Estado', sortable: true, type: ColumnType.Decimal },");
    expect(list).not.toContain('ColumnType.Lookup');
  });
});
