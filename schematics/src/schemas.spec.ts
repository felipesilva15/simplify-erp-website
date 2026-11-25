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

/** Opções inferidas automaticamente que não precisam de pergunta. */
const SILENT_OPTIONS = new Set(['treeParentField', 'treeLabelField']);

/** O Angular CLI envia opções em camelCase (ex.: --module-label → moduleLabel). */
const camel = (key: string): string => key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

interface SchemaProperty {
  type?: string;
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

    for (const key of Object.keys(properties).filter((key) => key.startsWith('skip'))) {
      expect(properties[key]['x-prompt'], `${name}.${key} não deve ter x-prompt`).toBeUndefined();
    }
  });

  it.each(SCHEMATICS)('%s pergunta toda opção não informada (exceto as inferidas)', (name) => {
    const { properties } = readSchema(name);

    for (const [key, property] of Object.entries(properties)) {
      // As versões kebab-case são aliases silenciosos para chamadas programáticas.
      if (key.includes('-') || key.startsWith('skip') || SILENT_OPTIONS.has(key)) {
        continue;
      }

      expect(property['x-prompt'], `${name}.${key} deve ter x-prompt`).toBeTruthy();
    }
  });

  it.each(SCHEMATICS)('%s aceita opções em camelCase e kebab-case', (name) => {
    const { properties } = readSchema(name);

    for (const key of Object.keys(properties).filter((key) => key.includes('-'))) {
      const alias = properties[camel(key)];

      expect(alias, `${name}.${camel(key)} deve existir`).toBeDefined();
      expect(alias.type, `${name}.${camel(key)} deve ter o mesmo tipo`).toBe(properties[key].type);
      expect(properties[key]['x-prompt'], `${name}.${key} é alias silencioso`).toBeUndefined();
    }
  });

  it('oferece table e tree no seletor de tipo de tabela', () => {
    for (const name of ['crud', 'list']) {
      const property = readSchema(name).properties.tableType as SchemaProperty & { enum?: string[] };

      expect(property.enum).toEqual(['table', 'tree']);
      expect(property['x-prompt']).toBeTruthy();
      // O padrão é aplicado em normalizeOptions, não no schema, para não
      // sobrescrever aliases kebab-case informados programaticamente.
      expect(property.default).toBeUndefined();
    }
  });
});
