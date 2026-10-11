import { strings } from '@angular-devkit/schematics';
import { buildExportImportLines, buildExportMenuBlock, buildFacadeConfigArg } from './export-menu';
import { generateListCode, generateModelCode } from './fields';
import { generateFormCode } from './form-codegen';
import { decapitalize } from './names';
import { NormalizedOptions, TemplateContext } from './types';

/** Monta o contexto consumido pelos arquivos `.template`. */
export function buildContext(options: NormalizedOptions): TemplateContext {
  const model = generateModelCode(options.fields);
  const list = generateListCode(options.fields);
  const form = generateFormCode(options.fields, options.formType);
  const segments = options.moduleSegments;
  const toAppDeep = '../'.repeat(segments + 4);

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
    lookupPlaceholder: list.searchPlaceholder,
    searchPlaceholder: list.searchPlaceholder,
    listRouterOutlet: options.formType === 'dialog' ? '<router-outlet />' : '',
    permViewAny: `${options.permission}.viewAny`,
    permView: `${options.permission}.view`,
    permCreate: `${options.permission}.create`,
    permEdit: `${options.permission}.edit`,
    permUpdate: `${options.permission}.update`,
    permDelete: `${options.permission}.delete`,
    modelFields: model.modelFields,
    colsLines: list.colsLines,
    filterLines: list.filterLines,
    formTypeLines: form.formTypeLines,
    formGroupLines: form.formGroupLines,
    formFieldBlocks: form.formFieldBlocks,
    formSkeletonBlocks: form.formSkeletonBlocks,
    formFormsImport: form.formFormsImport,
    formPrimeImports: form.formPrimeImports,
    formImportModules: form.formImportModules,
    listExportImports: options.withExport ? `\n${buildExportImportLines(toAppDeep)}` : '',
    listExportMenuBlock: options.withExport ? `\n${buildExportMenuBlock()}\n` : '',
    listFacadeConfig: options.withExport ? buildFacadeConfigArg() : '',
  };
}
