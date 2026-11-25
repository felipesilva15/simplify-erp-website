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

  it('adiciona o item no grupo existente mesmo quando o rótulo do módulo difere', async () => {
    const tree = createTree();
    const current = tree.readContent(MENU);
    const group = `  {
    label: 'Obra',
    icon: 'pi pi-hammer',
    active: false,
    items: [
      {
        label: 'Tipos de projeto',
        icon: 'pi pi-star',
        active: false,
        link: '/construction/project-types',
        permission: 'projectTypes.viewAny'
      }
    ]
  },
`;

    tree.overwrite(MENU, current.replace('  {\n    separator: true\n  }', `${group}  {\n    separator: true\n  }`));
    tree.create(
      '/src/app/features/construction/construction.routes.ts',
      "import { Routes } from '@angular/router';\n\nexport const CONSTRUCTION_ROUTES: Routes = [];\n",
    );

    const result = await runner.runSchematic('menu', { module: 'construction', name: 'construction-phase' }, tree);
    const menu = result.readContent(MENU);

    expect(menu).toContain("link: '/construction/construction-phases'");
    expect(menu.split("label: 'Obra'").length - 1).toBe(1);
    expect(menu.split("label: 'Construction'").length - 1).toBe(0);

    const groupStart = menu.indexOf("label: 'Obra'");
    const itemStart = menu.indexOf("link: '/construction/construction-phases'");

    expect(itemStart).toBeGreaterThan(groupStart);
    expect(menu.indexOf("separator: true", groupStart)).toBeGreaterThan(itemStart);
  });
});
