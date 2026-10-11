import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();
const MENU = '/src/app/core/config/menu.ts';

describe('menu schematic', () => {
  it('adiciona o item no grupo existente do módulo', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('menu', { module: 'third-party', name: 'partner-type' }, tree);

    const menu = result.readContent(MENU);
    expect(menu).toContain("label: 'Partner types'");
    expect(menu).toContain("link: '/third-party/partner-types'");
    expect(menu).toContain("permission: 'partnerTypes.viewAny'");

    const groupOccurrences = menu.split("label: 'Terceiro'").length - 1;
    expect(groupOccurrences).toBe(1);
  });

  it('usa os rótulos e o ícone informados', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'menu',
      {
        module: 'third-party',
        name: 'partner-type',
        'label-plural': 'Tipos de parceiro',
        'menu-icon': 'pi pi-tag',
      },
      tree,
    );

    const menu = result.readContent(MENU);
    expect(menu).toContain("label: 'Tipos de parceiro'");
    expect(menu).toContain("icon: 'pi pi-tag'");
  });

  it('é idempotente', async () => {
    const tree = createTree();
    const first = await runner.runSchematic('menu', { module: 'third-party', name: 'partner-type' }, tree);
    const second = await runner.runSchematic('menu', { module: 'third-party', name: 'partner-type' }, first);

    const menu = second.readContent(MENU);
    expect(menu.split("link: '/third-party/partner-types'").length - 1).toBe(1);
  });
});
