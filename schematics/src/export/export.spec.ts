import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();
const LIST = '/src/app/features/third-party/partner-types/pages/partner-type-list/partner-type-list.page.ts';

describe('export schematic', () => {
  it('adiciona as opções de exportação a uma listagem existente', async () => {
    const tree = createTree();
    const withList = await runner.runSchematic('list', { module: 'third-party', name: 'partner-type' }, tree);
    const result = await runner.runSchematic('export', { module: 'third-party', name: 'partner-type' }, withList);

    const list = result.readContent(LIST);
    expect(list).toContain('const exportMenu: ExportMenuItem[] = [');
    expect(list).toContain("import { ExportExtension } from '../../../../../core/enums/export-extension';");
    expect(list).toContain("import { ExportFormat } from '../../../../../core/enums/export-format';");
    expect(list).toContain("import { ExportMenuItem } from '../../../../../core/models/export-menu-item';");
    expect(list).toContain('exportMenu: exportMenu');
    expect(list).toContain('new CrudListFacade<PartnerType>(service, {');
  });

  it('é idempotente: rodar duas vezes não duplica as opções', async () => {
    const tree = createTree();
    const withList = await runner.runSchematic('list', { module: 'third-party', name: 'partner-type' }, tree);
    const once = await runner.runSchematic('export', { module: 'third-party', name: 'partner-type' }, withList);
    const twice = await runner.runSchematic('export', { module: 'third-party', name: 'partner-type' }, once);

    const list = twice.readContent(LIST);
    expect(list.split('exportMenu: exportMenu').length - 1).toBe(1);
    expect(list.split('const exportMenu: ExportMenuItem[] = [').length - 1).toBe(1);
  });

  it('não falha quando a listagem não existe', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('export', { module: 'third-party', name: 'partner-type' }, tree);

    expect(result.exists(LIST)).toBe(false);
  });
});
