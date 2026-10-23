import { SchematicsException, strings, Tree } from '@angular-devkit/schematics';
import { parseFields } from './fields';
import { MODULE_LABELS } from './module-labels';
import { constantCase, humanize, pluralize, singularize } from './names';
import { readText } from './tree';
import { BaseSchema, FieldDefinition, FormType, NormalizedModuleOptions, NormalizedOptions } from './types';
import { readSourceRoot } from './workspace';

/** Esqueleto mínimo gerado quando `--fields` não é informado. */
const DEFAULT_FIELDS: FieldDefinition[] = [{ name: 'name', type: 'string', label: 'Nome', optional: false }];

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  const detectLookups = schema['detect-lookups'] !== false;
  const parsedFields = parseFields(schema.fields, detectLookups);
  const fields = parsedFields.length > 0 ? parsedFields : DEFAULT_FIELDS;
  const formType: FormType = schema['form-type'] === 'page' ? 'page' : 'dialog';

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
    moduleRoutesConst: `${constantCase(module)}_ROUTES`,
    moduleLabel: schema['module-label']?.trim() || MODULE_LABELS[module] || humanize(module),
    label: schema.label?.trim() || humanize(singular),
    labelPlural: schema['label-plural']?.trim() || humanize(resource),
    menuIcon: schema['menu-icon']?.trim() || 'pi pi-star',
    permission: schema['permission-key']?.trim() || strings.camelize(resource),
    formType,
    fields,
    withExport: schema['with-export'] === true,
    withLog: schema['with-log'] === true,
    skipMenu: schema['skip-menu'] === true,
    skipRoutes: schema['skip-routes'] === true,
    skipLookup: schema['skip-lookup'] === true,
    skipTests: schema['skip-tests'] === true,
    detectLookups,
    placeholder: schema.placeholder?.trim() ?? '',
    lookupPlaceholder: schema['lookup-placeholder']?.trim() ?? '',
    force: schema.force === true,
    dryRun: schema['dry-run'] === true,
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
    routesPath: `${moduleDir}/${module.split('/').pop()}.routes.ts`,
    moduleRoutesConst: `${constantCase(module)}_ROUTES`,
    moduleLabel: schema['module-label']?.trim() || MODULE_LABELS[module] || humanize(module),
    menuIcon: schema['menu-icon']?.trim() || 'pi pi-folder',
    skipMenu: schema['skip-menu'] === true,
    skipRoutes: schema['skip-routes'] === true,
    force: schema.force === true,
    sourceRoot,
    moduleSegments: module.split('/').length,
  };
}
