import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();
const LIST = '/src/app/features/third-party/partner-types/pages/partner-type-list/partner-type-list.page.ts';

describe('list schematic', () => {
  it('gera a listagem com colunas, filtros e menu de ações', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'list',
      { module: 'third-party', name: 'partner-type', fields: 'name:string:Nome' },
      tree,
    );

    const list = result.readContent(LIST);
    expect(list).toContain('export class PartnerTypeListPage');
    expect(list).toContain("routerLink: '/third-party/partner-types'");
    expect(list).toContain("{ field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },");
    expect(list).toContain("{ name: 'name', label: 'Nome', type: ColumnType.Text },");
    expect(list).toContain("label: 'Visualizar'");
    expect(list).toContain("label: 'Editar'");
    expect(list).toContain("label: 'Deletar'");

    const html = result.readContent(
      '/src/app/features/third-party/partner-types/pages/partner-type-list/partner-type-list.page.html',
    );
    expect(html).toContain('<app-list-page');
    expect(html).toContain('<router-outlet />');
  });

  it('inclui a exportação quando --with-export é informado', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'list',
      { module: 'third-party', name: 'partner-type', 'with-export': true },
      tree,
    );

    const list = result.readContent(LIST);
    expect(list).toContain('const exportMenu: ExportMenuItem[] = [');
    expect(list).toContain('exportMenu: exportMenu');
  });
});
