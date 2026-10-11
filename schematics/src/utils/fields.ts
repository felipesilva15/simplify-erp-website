import { SchematicsException } from '@angular-devkit/schematics';
import { humanize } from './names';
import { FieldDefinition, FieldType } from './types';

const FIELD_TYPES: readonly FieldType[] = [
  'string',
  'text',
  'textarea',
  'email',
  'number',
  'integer',
  'decimal',
  'currency',
  'percent',
  'boolean',
  'date',
  'datetime',
];

const STRING_TYPES: readonly FieldType[] = ['string', 'text', 'email'];
const NUMBER_TYPES: readonly FieldType[] = ['number', 'integer', 'decimal', 'currency', 'percent'];

/** Escapa um valor para uso como string literal TS entre aspas simples. */
export function tsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Faz o parsing da opção `--fields`.
 * Gramática: `nome:tipo[:Rótulo]`, campos separados por vírgula.
 * O nome pode terminar com `?` para indicar campo opcional.
 */
export function parseFields(raw: string | undefined): FieldDefinition[] {
  if (!raw || !raw.trim()) {
    return [];
  }

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => parseField(entry));
}

function parseField(entry: string): FieldDefinition {
  const match = /^([A-Za-z_][A-Za-z0-9_]*)(\?)?:([a-zA-Z]+)(?::(.+))?$/.exec(entry);

  if (!match) {
    throw new SchematicsException(
      `Campo inválido em --fields: "${entry}". Use "nome:tipo[:Rótulo]" (ex.: nome:string:Nome).`,
    );
  }

  const [, name, optionalMarker, typeRaw, labelRaw] = match;
  const type = typeRaw.toLowerCase() as FieldType;

  if (!FIELD_TYPES.includes(type)) {
    throw new SchematicsException(
      `Tipo inválido em --fields para "${name}": "${typeRaw}". Tipos aceitos: ${FIELD_TYPES.join(', ')}.`,
    );
  }

  return {
    name,
    type,
    optional: optionalMarker === '?',
    label: labelRaw && labelRaw.trim() ? labelRaw.trim() : humanize(name),
  };
}

export function isStringField(field: FieldDefinition): boolean {
  return STRING_TYPES.includes(field.type);
}

export function isNumberField(field: FieldDefinition): boolean {
  return NUMBER_TYPES.includes(field.type);
}

export function isDateField(field: FieldDefinition): boolean {
  return field.type === 'date' || field.type === 'datetime';
}

function tsType(field: FieldDefinition): string {
  if (isStringField(field)) {
    return 'string';
  }

  if (isNumberField(field)) {
    return 'number';
  }

  if (field.type === 'boolean') {
    return 'boolean';
  }

  return 'Date';
}

function columnType(field: FieldDefinition): string {
  switch (field.type) {
    case 'string':
    case 'text':
    case 'textarea':
    case 'email':
      return 'Text';
    case 'integer':
      return 'Integer';
    case 'currency':
      return 'Currency';
    case 'percent':
      return 'Percent';
    case 'boolean':
      return 'Boolean';
    case 'date':
      return 'Date';
    case 'datetime':
      return 'Datetime';
    default:
      return 'Decimal';
  }
}

export interface ModelCode {
  modelFields: string;
}

/** Gera as linhas de propriedades do model (sem as chaves da interface). */
export function generateModelCode(fields: FieldDefinition[]): ModelCode {
  const lines = fields.map((field) => `    ${field.name}: ${tsType(field)};`);

  return { modelFields: lines.length ? `${lines.join('\n')}\n` : '' };
}

export interface ListCode {
  colsLines: string;
  filterLines: string;
  searchPlaceholder: string;
}

/** Gera as linhas de colunas/filtros e o placeholder de busca da listagem. */
export function generateListCode(fields: FieldDefinition[]): ListCode {
  const colsLines = fields
    .map(
      (field) =>
        `    { field: '${field.name}', header: '${tsString(field.label)}', sortable: true, type: ColumnType.${columnType(field)} },`,
    )
    .join('\n');

  const filterLines = fields
    .map(
      (field) =>
        `    { name: '${field.name}', label: '${tsString(field.label)}', type: ColumnType.${columnType(field)} },`,
    )
    .join('\n');

  const terms = ['ID', ...fields.map((field) => field.label)];
  const searchPlaceholder = `Buscar por ${terms.join(', ')}...`;

  return { colsLines, filterLines, searchPlaceholder };
}
