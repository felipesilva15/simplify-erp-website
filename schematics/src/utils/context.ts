import { strings } from '@angular-devkit/schematics';
import { buildExportImportLines, buildExportMenuBlock, buildFacadeConfigArg } from './export-menu';
import { generateListCode, generateModelCode, tsString } from './fields';
import { generateFormCode } from './form-codegen';
import { decapitalize } from './names';
import { buildServiceCode } from './service-code';
import { LookupRenderContext, NormalizedOptions, TemplateContext } from './types';

/** Monta o contexto consumido pelos arquivos `.template`. */
export function buildContext(options: NormalizedOptions): TemplateContext {
  const segments = options.moduleSegments;
  const toAppDeep = '../'.repeat(segments + 4);
  const lookupContext: LookupRenderContext = {
    module: options.module,
    singular: options.singular,
    toAppDeep,
    lookupsEnabled: !options.skipLookup,
  };

  const model = generateModelCode(options.fields);
  const list = generateListCode(options.fields, lookupContext);
  const form = generateFormCode(options.fields, options.formType, lookupContext);
  const service = buildServiceCode(options);

  const rawSearchPlaceholder = options.placeholder || list.searchPlaceholder;
  const rawLookupPlaceholder = options.lookupPlaceholder || rawSearchPlaceholder;
  const searchPlaceholder = tsString(rawSearchPlaceholder);
  const lookupPlaceholder = tsString(rawLookupPlaceholder).replace(/"/g, '&quot;');

  const isTree = options.tableType === 'tree';
  const listColumnsType = isTree ? 'TreeTableColumn' : 'TableColumn';
  const listComponent = isTree ? 'TreeCrudListComponent' : 'CrudListComponent';
  const listColumnsModel = isTree ? 'tree-table-column' : 'table-column';
  const listComponentPath = isTree
    ? 'tree-crud-list/tree-crud-list.component'
    : 'crud-list/crud-list.component';

  const treeImports = isTree
    ? [
        `import { FilterOperator } from '${toAppDeep}core/enums/filter-operator';`,
        `import { TreeListConfig } from '${toAppDeep}core/models/tree-list-config';`,
      ].join('\n')
    : '';

  const parentKey = options.treeParentField;
  const rootFilter = `{ ${parentKey}: { [FilterOperator.Equal]: null } }`;
  const treeConfigLines = isTree
    ? [
        '  treeConfig: TreeListConfig = {',
        "    idKey: 'id',",
        `    parentKey: '${parentKey}',`,
        `    labelKey: '${options.treeLabelField}',`,
        `    rootFilter: ${rootFilter},`,
        '    levelColors: {',
        "      0: 'bg-primary-300',",
        "      1: 'bg-primary-100',",
        "      2: 'bg-primary-50'",
        '    }',
        '  };',
      ].join('\n')
    : '';

  const listFacadeConfig = options.withExport ? buildFacadeConfigArg() : '';
  const treeFacadeLines = isTree
    ? ['        fixedFilters: ' + rootFilter + ',', '        fetchAll: true'].join('\n')
    : '';
  let listFacadeOptions = listFacadeConfig;

  if (isTree) {
    const exportLine = options.withExport ? '        exportMenu: exportMenu' : '';
    const lines = [treeFacadeLines, exportLine].filter(Boolean).join(',\n');

    listFacadeOptions = `, {\n${lines}\n      }`;
  }

  return {
    ...options,
    name: options.singular,
    dasherize: strings.dasherize,
    toApp: '../'.repeat(segments + 3),
    toAppDeep,
    toAppRoutes: '../'.repeat(segments + 2),
    listSelector: `app-${options.singular}-list`,
    formSelector: `app-${options.singular}-form`,
    lookupSelector: `app-${options.singular}-lookup`,
    listTitle: `Listar ${decapitalize(options.labelPlural)}`,
    lookupPlaceholder,
    searchPlaceholder,
    listRouterOutlet: options.formType === 'dialog' ? '<router-outlet />' : '',
    listColumnsType,
    listColumnsModel,
    listColumnsDeclaration: isTree ? `${listColumnsType}[]` : `${listColumnsType}<${options.className}>[]`,
    listComponent,
    listSelectorTag: isTree ? 'app-tree-crud-list' : 'app-crud-list',
    listComponentPath,
    listExtraImports: treeImports ? `\n${treeImports}` : '',
    treeConfigLines: treeConfigLines ? `\n${treeConfigLines}` : '',
    treeConfigBinding: isTree ? '[treeConfig]="treeConfig" ' : '',
    listFacadeOptions,
    permViewAny: `${options.permission}.viewAny`,
    permView: `${options.permission}.view`,
    permCreate: `${options.permission}.create`,
    permEdit: `${options.permission}.edit`,
    permUpdate: `${options.permission}.update`,
    permDelete: `${options.permission}.delete`,
    modelFields: model.modelFields,
    modelImports: model.modelImports,
    colsLines: list.colsLines,
    filterLines: list.filterLines,
    listImports: list.listImports,
    formTypeLines: form.formTypeLines,
    formGroupLines: form.formGroupLines,
    formFieldBlocks: form.formFieldBlocks,
    formSkeletonBlocks: form.formSkeletonBlocks,
    formFormsImport: form.formFormsImport,
    formPrimeImports: form.formPrimeImports,
    formImportModules: form.formImportModules,
    formExtraImports: form.formExtraImports,
    formEnumProperties: form.formEnumProperties,
    serviceImports: service.imports,
    serviceImplements: service.implements,
    serviceMethods: service.methods,
    listExportImports: options.withExport ? `\n${buildExportImportLines(toAppDeep)}` : '',
    listExportMenuBlock: options.withExport ? `\n${buildExportMenuBlock()}\n` : '',
  };
}
