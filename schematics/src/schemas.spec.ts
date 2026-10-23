import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SCHEMATICS = [
  'crud',
  'module',
  'model',
  'service',
  'list',
  'form',
  'routes',
  'menu',
  'lookup',
  'export',
  'enum',
];

interface SchemaProperty {
  default?: unknown;
  'x-prompt'?: unknown;
}

interface Schema {
  properties: Record<string, SchemaProperty>;
}

function readSchema(name: string): Schema {
  return JSON.parse(
    readFileSync(join(process.cwd(), 'src', name, 'schema.json'), 'utf-8'),
  ) as Schema;
}

describe('schema prompts', () => {
  it.each(SCHEMATICS)('%s não pergunta as opções skip-*', (name) => {
    const { properties } = readSchema(name);

    for (const key of Object.keys(properties).filter((key) => key.startsWith('skip-'))) {
      expect(properties[key]['x-prompt'], `${name}.${key} não deve ter x-prompt`).toBeUndefined();
    }
  });

  it('pergunta todas as demais opções não informadas', () => {
    for (const name of SCHEMATICS) {
      const { properties } = readSchema(name);

      for (const [key, property] of Object.entries(properties)) {
        if (key.startsWith('skip-')) {
          continue;
        }

        expect(property['x-prompt'], `${name}.${key} deve ter x-prompt`).toBeTruthy();
      }
    }
  });

  it('declara --with-log no crud e no service', () => {
    for (const name of ['crud', 'service']) {
      const property = readSchema(name).properties['with-log'];

      expect(property, `${name} deve declarar with-log`).toBeDefined();
      expect(property.default).toBe(false);
      expect(property['x-prompt']).toBeTruthy();
    }
  });
});
