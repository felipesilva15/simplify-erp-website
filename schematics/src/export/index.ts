import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { buildExportImportLines, buildExportMenuBlock, buildFacadeConfigArg } from '../utils/export-menu';
import { normalizeOptions } from '../utils/options';
import { findMatchingIndex, insertAfterLastImport } from '../utils/text';
import { readText, writeText } from '../utils/tree';
import { BaseSchema, NormalizedOptions } from '../utils/types';

/** Insere o bloco `const exportMenu` antes do decorador `@Component`. */
function insertExportMenuConst(text: string): string {
  const componentIndex = text.indexOf('@Component');

  if (componentIndex === -1) {
    return text;
  }

  return `${text.slice(0, componentIndex)}${buildExportMenuBlock()}\n\n${text.slice(componentIndex)}`;
}

/** Injeta `exportMenu` no terceiro argumento da fábrica da `CrudListFacade`. */
function updateFacadeConfig(text: string): string {
  const facadeIndex = text.indexOf('new CrudListFacade');

  if (facadeIndex === -1) {
    return text;
  }

  const openParen = text.indexOf('(', facadeIndex);
  const closeParen = findMatchingIndex(text, openParen);
  const permissionsOpen = text.indexOf('{', openParen);
  const permissionsClose = findMatchingIndex(text, permissionsOpen);

  let cursor = permissionsClose + 1;

  while (cursor < closeParen && /\s/.test(text[cursor])) {
    cursor++;
  }

  if (text[cursor] === ',') {
    const configOpen = text.indexOf('{', cursor);

    if (configOpen === -1 || configOpen > closeParen) {
      return text;
    }

    const configClose = findMatchingIndex(text, configOpen);
    const inner = text.slice(configOpen + 1, configClose);
    const newInner =
      inner.trim().length === 0
        ? '\n        exportMenu: exportMenu\n      '
        : `${inner.replace(/\s+$/, '')},\n        exportMenu: exportMenu\n      `;

    return `${text.slice(0, configOpen + 1)}${newInner}${text.slice(configClose)}`;
  }

  if (text[cursor] === ')') {
    return `${text.slice(0, closeParen)}${buildFacadeConfigArg()}${text.slice(closeParen)}`;
  }

  return text;
}

/** Adiciona as opções de exportação à listagem existente do recurso. */
export function addExport(options: NormalizedOptions): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    const path = `${options.featureDir}/pages/${options.singular}-list/${options.singular}-list.page.ts`;
    const content = readText(tree, path);

    if (content === null) {
      context.logger.warn(
        `Listagem não encontrada em ${path}. Gere a listagem (schematic "list") antes de habilitar a exportação.`,
      );
      return tree;
    }

    if (content.includes('exportMenu')) {
      context.logger.info(`A listagem ${path} já possui opções de exportação; nada a fazer.`);
      return tree;
    }

    const toAppDeep = '../'.repeat(options.moduleSegments + 4);
    let updated = insertAfterLastImport(content, buildExportImportLines(toAppDeep));

    updated = insertExportMenuConst(updated);
    updated = updateFacadeConfig(updated);
    writeText(tree, path, updated);

    return tree;
  };
}

export default function exportOptions(options: BaseSchema): Rule {
  return (tree, context) => addExport(normalizeOptions(options, tree))(tree, context);
}
