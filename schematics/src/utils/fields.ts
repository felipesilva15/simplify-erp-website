import { SchematicsException, strings } from '@angular-devkit/schematics';
import { humanize, pluralize } from './names';
import { EnumValue, FieldDefinition, FieldType, LookupRenderContext } from './types';

const PRIMITIVE_TYPES: readonly FieldType[] = [
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

const FIELD_TYPES: readonly FieldType[] = [...PRIMITIVE_TYPES, 'lookup', 'enum'];

const STRING_TYPES: readonly FieldType[] = ['string', 'text', 'email', 'textarea'];
const NUMBER_TYPES: readonly FieldType[] = ['number', 'integer', 'decimal', 'currency', 'percent'];

/** Escapa um valor para uso como string literal TS entre aspas simples. */
export function tsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Faz o parsing da opção `--fields`.
 *
 * Gramática: `nome[?]:tipo[:Rótulo][:extras]`, campos separados por vírgula.
 * - `?` após o nome marca o campo como opcional.
 * - `lookup`: `extras` = `[módulo][:recurso]`. O módulo padrão é o atual e o
 *   recurso referenciado é derivado do nome (removendo o sufixo `_id`). Use o
 *   segundo extra para auto-referências (ex.: `parent_category_id:lookup:Rótulo::product-category`).
 * - `enum`: `extras` = `[ClasseEnum]:VALOR=Rótulo|VALOR=Rótulo`.
 * - Campos terminados em `_id` viram `lookup` automaticamente quando
 *   `detectLookups` é `true`.
 */
export function parseFields(raw: string | undefined, detectLookups = true): FieldDefinition[] {
  if (!raw || !raw.trim()) {
    return [];
  }

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => parseField(entry, detectLookups));
}

function parseField(entry: string, detectLookups: boolean): FieldDefinition {
  const parts = entry.split(':');
  const namePart = parts[0].trim();
  const nameMatch = /^([A-Za-z_][A-Za-z0-9_]*)(\?)?$/.exec(namePart);

  if (!nameMatch) {
    throw new SchematicsException(
      `Campo inválido em --fields: "${entry}". Use "nome:tipo[:Rótulo]" (ex.: nome:string:Nome).`,
    );
  }

  const name = nameMatch[1];
  const optional = nameMatch[2] === '?';
  const typeRaw = (parts[1] ?? '').trim().toLowerCase();
  const label = parts[2]?.trim() || humanize(name);
  const extras = parts.slice(3).map((part) => part.trim());

  if (!FIELD_TYPES.includes(typeRaw as FieldType)) {
    throw new SchematicsException(
      `Tipo inválido em --fields para "${name}": "${typeRaw}". Tipos aceitos: ${FIELD_TYPES.join(', ')}.`,
    );
  }

  const base: FieldDefinition = { name, type: typeRaw as FieldType, label, optional };

  if (typeRaw === 'enum') {
    return { ...base, ...parseEnumSpec(name, extras) };
  }

  if (typeRaw === 'lookup') {
    return {
      ...base,
      reference: extras[1] || lookupReferenceName(name),
      referenceModule: extras[0] || undefined,
    };
  }

  if (detectLookups && /_id$/i.test(name)) {
    return {
      ...base,
      type: 'lookup',
      inferredLookup: true,
      reference: extras[1] || lookupReferenceName(name),
      referenceModule: extras[0] || undefined,
    };
  }

  return base;
}

function parseEnumSpec(name: string, extras: string[]): Pick<FieldDefinition, 'enumClass' | 'enumFile' | 'enumValues'> {
  let enumClass: string | undefined;
  let valuesRaw = '';

  if (extras.length >= 2) {
    enumClass = extras[0];
    valuesRaw = extras.slice(1).join(':');
  } else if (extras.length === 1) {
    if (extras[0].includes('=')) {
      valuesRaw = extras[0];
    } else {
      enumClass = extras[0];
    }
  }

  if (!valuesRaw.trim()) {
    throw new SchematicsException(
      `Campo enum "${name}" exige valores: "nome:enum[:Rótulo][:ClasseEnum]:VALOR=Rótulo|VALOR=Rótulo".`,
    );
  }

  const enumValues = valuesRaw
    .split('|')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => parseEnumValue(entry, name));

  if (enumValues.length === 0) {
    throw new SchematicsException(`Campo enum "${name}" não possui valores válidos.`);
  }

  const classOrName = enumClass || name;

  return {
    enumClass: strings.classify(classOrName),
    enumFile: strings.dasherize(strings.classify(classOrName)),
    enumValues,
  };
}

function parseEnumValue(entry: string, fieldName: string): EnumValue {
  const separatorIndex = entry.indexOf('=');
  const value = (separatorIndex === -1 ? entry : entry.slice(0, separatorIndex)).trim();
  const label = (separatorIndex === -1 ? entry : entry.slice(separatorIndex + 1)).trim() || value;

  if (!value) {
    throw new SchematicsException(`Valor de enum inválido no campo "${fieldName}": "${entry}".`);
  }

  return { value, name: strings.classify(value.toLowerCase()), label };
}

/** `state_id` → `state`; `parent_category_id` → `parent-category`. */
function lookupReferenceName(name: string): string {
  return strings.dasherize(name.replace(/_id$/i, ''));
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

export function isLookupField(field: FieldDefinition): boolean {
  return field.type === 'lookup';
}

export function isEnumField(field: FieldDefinition): boolean {
  return field.type === 'enum';
}

function tsType(field: FieldDefinition): string {
  if (isStringField(field)) {
    return 'string';
  }

  if (isNumberField(field) || isLookupField(field)) {
    return 'number';
  }

  if (field.type === 'boolean') {
    return 'boolean';
  }

  if (isEnumField(field)) {
    return field.enumClass ?? 'string';
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
    case 'lookup':
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

/** Referência resolvida de um campo de lookup. */
export interface LookupReference {
  /** Recurso referenciado no singular, kebab-case (ex.: `state`). */
  singular: string;
  /** Recurso referenciado no plural, kebab-case (ex.: `states`). */
  plural: string;
  /** Classe do recurso referenciado (ex.: `State`). */
  className: string;
  /** Classe do componente de lookup (ex.: `StateLookupComponent`). */
  componentClass: string;
  /** Seletor do componente de lookup (ex.: `app-state-lookup`). */
  selector: string;
  /** Caminho de import relativo a partir de `pages/<página>/`. */
  importPath: string;
  /** `true` quando o recurso referenciado é o próprio recurso. */
  self: boolean;
}

/**
 * Resolve o componente de lookup referenciado por um campo, calculando o
 * caminho de import relativo a partir de `pages/<página>/`.
 */
export function resolveLookupReference(field: FieldDefinition, context: LookupRenderContext): LookupReference {
  const singular = field.reference || lookupReferenceName(field.name);
  const plural = pluralize(singular);
  const className = strings.classify(singular);
  const referenceModule = field.referenceModule?.trim() || context.module;
  const self = singular === context.singular && referenceModule === context.module;

  let importPath: string;
  if (self) {
    importPath = `../../components/${singular}-lookup/${singular}-lookup.component`;
  } else if (referenceModule === context.module) {
    importPath = `../../../${plural}/components/${singular}-lookup/${singular}-lookup.component`;
  } else {
    importPath = `${context.toAppDeep}features/${referenceModule}/${plural}/components/${singular}-lookup/${singular}-lookup.component`;
  }

  return {
    singular,
    plural,
    className,
    componentClass: `${className}LookupComponent`,
    selector: `app-${singular}-lookup`,
    importPath,
    self,
  };
}

export interface ModelCode {
  modelFields: string;
  modelImports: string;
}

/** Gera as linhas de propriedades do model (sem as chaves da interface). */
export function generateModelCode(fields: FieldDefinition[]): ModelCode {
  const enumImports = new Map<string, string>();

  for (const field of fields) {
    if (isEnumField(field) && field.enumClass && field.enumFile) {
      enumImports.set(field.enumClass, `import { ${field.enumClass} } from '../enums/${field.enumFile}';`);
    }
  }

  const lines = fields.map((field) => `    ${field.name}${field.optional ? '?' : ''}: ${tsType(field)};`);

  return {
    modelFields: lines.length ? `${lines.join('\n')}\n` : '',
    modelImports: enumImports.size ? `${[...enumImports.values()].join('\n')}\n` : '',
  };
}

export interface ListCode {
  colsLines: string;
  filterLines: string;
  searchPlaceholder: string;
  listImports: string;
}

/** Gera as linhas de colunas/filtros, imports e o placeholder de busca da listagem. */
export function generateListCode(fields: FieldDefinition[], context: LookupRenderContext): ListCode {
  const cols: string[] = [];
  const filters: string[] = [];
  const imports = new Map<string, string>();

  for (const field of fields) {
    const header = tsString(field.label);

    if (isLookupField(field) && context.lookupsEnabled) {
      const reference = resolveLookupReference(field, context);

      imports.set(reference.componentClass, `import { ${reference.componentClass} } from '${reference.importPath}';`);
      filters.push(
        `    { name: '${field.name}', label: '${header}', type: ColumnType.Lookup, component: ${reference.componentClass} },`,
      );
      continue;
    }

    if (isEnumField(field) && field.enumClass && field.enumFile) {
      imports.set(
        field.enumClass,
        `import { ${field.enumClass}Labels, ${field.enumClass}Options } from '../../enums/${field.enumFile}';`,
      );
      cols.push(
        `    { field: '${field.name}', header: '${header}', sortable: true, type: ColumnType.Enum, enumOptionLabels: ${field.enumClass}Labels },`,
      );
      filters.push(
        `    { name: '${field.name}', label: '${header}', type: ColumnType.Enum, options: ${field.enumClass}Options },`,
      );
      continue;
    }

    cols.push(
      `    { field: '${field.name}', header: '${header}', sortable: true, type: ColumnType.${columnType(field)} },`,
    );
    filters.push(`    { name: '${field.name}', label: '${header}', type: ColumnType.${columnType(field)} },`);
  }

  const terms = ['ID', ...fields.filter(isStringField).map((field) => field.label)];
  const searchPlaceholder = `Buscar por ${terms.join(', ')}...`;

  return {
    colsLines: cols.join('\n'),
    filterLines: filters.join('\n'),
    searchPlaceholder,
    listImports: imports.size ? `\n${[...imports.values()].join('\n')}` : '',
  };
}
