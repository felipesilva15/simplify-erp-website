import { SchematicsException, strings, Tree } from '@angular-devkit/schematics';
import { parseFields } from './fields';
import { MODULE_LABELS } from './module-labels';
import { constantCase, humanize, pluralize, pluralizeLabel, singularize } from './names';
import { readText } from './tree';
import { BaseSchema, FieldDefinition, FormType, NormalizedModuleOptions, NormalizedOptions, TableType } from './types';
import { readSourceRoot } from './workspace';

/** Esqueleto mínimo gerado quando `--fields` não é informado. */
const DEFAULT_FIELDS: FieldDefinition[] = [{ name: 'name', type: 'string', label: 'Nome', optional: false }];

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Lê uma opção aceitando o nome camelCase usado pelo Angular CLI e o nome
 * kebab-case usado por chamadas programáticas/antigos parâmetros.
 */
export function readOption<T>(schema: object, key: string): T | undefined {
  const values = schema as Record<string, unknown>;
  const camelKey = key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

  return (values[camelKey] ?? values[key]) as T | undefined;
}

/** Último segmento do módulo: define o nome do arquivo e da constante de rotas. */
export function moduleBaseName(module: string): string {
  return module.split('/').pop() ?? module;
}

/** Primeiro segmento normalmente identifica o grupo de menu de módulos aninhados. */
function moduleRootName(module: string): string {
  return module.split('/')[0];
}

/** Rótulo do módulo: respeita mapeamentos e usa a raiz em módulos aninhados. */
export function resolveModuleLabel(module: string): string {
  const candidates = [module, moduleRootName(module), moduleBaseName(module)];
  const known = candidates.find((candidate) => MODULE_LABELS[candidate]);

  return MODULE_LABELS[known ?? moduleBaseName(module)] ?? humanize(known ?? module);
}

/** Infere o campo pai da árvore a partir dos campos informados. */
function inferTreeParentField(fields: FieldDefinition[]): string {
  const parent = fields.find(
    (field) =>
      /^parent/i.test(field.name) &&
      (field.type === 'lookup' || /_id$/i.test(field.name)),
  );

  return parent?.name ?? 'parent_id';
}

/** Infere o campo de rótulo do nó a partir dos campos informados. */
function inferTreeLabelField(fields: FieldDefinition[]): string {
  const named = fields.find((field) => field.name === 'name' && (isTextField(field) || field.type === 'string'));

  return named?.name ?? fields.find(isTextField)?.name ?? 'name';
}

function isTextField(field: FieldDefinition): boolean {
  return ['string', 'text', 'textarea', 'email'].includes(field.type);
}

/** Valida as opções, deriva os nomes e resolve os caminhos do projeto. */
export function normalizeOptions(schema: BaseSchema, tree: Tree): NormalizedOptions {
  const module = strings.dasherize((schema.module ?? '').trim());
  const rawName = strings.dasherize((schema.name ?? '').trim());

  if (!module) {
    throw new SchematicsException('Informe o módulo de destino com --module=<módulo>.');
  }

  if (!rawName) {
    throw new SchematicsException('Informe o nome do recurso com --name=<recurso>.');
  }

  const singular = singularize(rawName);

  if (!KEBAB_CASE.test(singular)) {
    throw new SchematicsException(
      `Nome de recurso inválido: "${schema.name}". Use kebab-case (ex.: partner-type).`,
    );
  }

  const sourceRoot = readSourceRoot((path) => readText(tree, path));
  const featuresRoot = `${sourceRoot}/app/features`;
  const moduleDir = `${featuresRoot}/${module}`;
  const moduleEntry = tree.getDir(moduleDir);

  if (moduleEntry.subfiles.length === 0 && moduleEntry.subdirs.length === 0) {
    const available = tree.getDir(featuresRoot).subdirs.sort();

    throw new SchematicsException(
      `Módulo "${module}" não encontrado em ${featuresRoot}. ` +
        `Crie-o com o schematic "module" (ng g ./schematics/collection.json:module --name=${module}) ` +
        `ou use um dos módulos disponíveis: ${available.join(', ') || '(nenhum)'}.`,
    );
  }

  const resource = schema.plural ? strings.dasherize(schema.plural.trim()) : pluralize(singular);
  const className = strings.classify(singular);
  const detectLookups = readOption<boolean>(schema, 'detect-lookups') !== false;
  const parsedFields = parseFields(schema.fields, detectLookups);
  const fields = parsedFields.length > 0 ? parsedFields : DEFAULT_FIELDS;
  const formType: FormType = readOption<FormType>(schema, 'form-type') === 'page' ? 'page' : 'dialog';
  const tableType: TableType = readOption<TableType>(schema, 'table-type') === 'tree' ? 'tree' : 'table';
  const label = schema.label?.trim() ?? '';
  const labelPlural = readOption<string>(schema, 'label-plural')?.trim() ?? '';

  return {
    module,
    resource,
    singular,
    className,
    serviceClass: `${className}Service`,
    listClass: `${className}ListPage`,
    formClass: formType === 'page' ? `${className}FormPage` : `${className}FormDialog`,
    lookupClass: `${className}LookupComponent`,
    routesConst: `${constantCase(resource)}_ROUTES`,
    moduleRoutesConst: `${constantCase(moduleBaseName(module))}_ROUTES`,
    moduleLabel: readOption<string>(schema, 'module-label')?.trim() || resolveModuleLabel(module),
    label: label || humanize(singular),
    labelPlural: labelPlural || (label ? pluralizeLabel(label) : humanize(resource)),
    menuIcon: readOption<string>(schema, 'menu-icon')?.trim() || 'pi pi-star',
    permission: readOption<string>(schema, 'permission-key')?.trim() || strings.camelize(resource),
    formType,
    tableType,
    treeParentField: readOption<string>(schema, 'tree-parent-field')?.trim() || inferTreeParentField(fields),
    treeLabelField: readOption<string>(schema, 'tree-label-field')?.trim() || inferTreeLabelField(fields),
    fields,
    withExport: readOption<boolean>(schema, 'with-export') === true,
    withLog: readOption<boolean>(schema, 'with-log') === true,
    skipMenu: readOption<boolean>(schema, 'skip-menu') === true,
    skipRoutes: readOption<boolean>(schema, 'skip-routes') === true,
    skipLookup: readOption<boolean>(schema, 'skip-lookup') === true,
    skipTests: readOption<boolean>(schema, 'skip-tests') === true,
    detectLookups,
    placeholder: schema.placeholder?.trim() ?? '',
    lookupPlaceholder: readOption<string>(schema, 'lookup-placeholder')?.trim() ?? '',
    force: schema.force === true,
    dryRun: readOption<boolean>(schema, 'dry-run') === true,
    sourceRoot,
    moduleSegments: module.split('/').length,
    featureDir: `${moduleDir}/${resource}`,
  };
}

/** Valida as opções e resolve os caminhos do schematic `module`. */
export function normalizeModuleOptions(schema: BaseSchema, tree: Tree): NormalizedModuleOptions {
  const module = strings.dasherize((schema.name ?? schema.module ?? '').trim());

  if (!module) {
    throw new SchematicsException('Informe o nome do módulo com --name=<módulo>.');
  }

  const MODULE_PATTERN = /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/;

  if (!MODULE_PATTERN.test(module)) {
    throw new SchematicsException(
      `Nome de módulo inválido: "${schema.name}". Use kebab-case (ex.: catalog) ou aninhado (ex.: financial/accounts).`,
    );
  }

  const sourceRoot = readSourceRoot((path) => readText(tree, path));
  const moduleDir = `${sourceRoot}/app/features/${module}`;

  return {
    module,
    moduleDir,
    routesPath: `${moduleDir}/${moduleBaseName(module)}.routes.ts`,
    moduleRoutesConst: `${constantCase(moduleBaseName(module))}_ROUTES`,
    moduleLabel: readOption<string>(schema, 'module-label')?.trim() || resolveModuleLabel(module),
    menuIcon: readOption<string>(schema, 'menu-icon')?.trim() || 'pi pi-folder',
    skipMenu: readOption<boolean>(schema, 'skip-menu') === true,
    skipRoutes: readOption<boolean>(schema, 'skip-routes') === true,
    force: schema.force === true,
    sourceRoot,
    moduleSegments: module.split('/').length,
  };
}
