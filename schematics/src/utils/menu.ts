import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { tsString } from './fields';
import { appendArrayItem } from './text';
import { readText, writeText } from './tree';
import { NormalizedOptions } from './types';

const GROUP_ITEM_INDENT = 6;

function buildItemBlock(options: NormalizedOptions, indent: number): string {
  const pad = ' '.repeat(indent);
  const inner = ' '.repeat(indent + 2);

  return [
    `${pad}{`,
    `${inner}label: '${tsString(options.labelPlural)}',`,
    `${inner}icon: '${options.menuIcon}',`,
    `${inner}active: false,`,
    `${inner}link: '/${options.module}/${options.resource}',`,
    `${inner}permission: '${options.permission}.viewAny'`,
    `${pad}}`,
  ].join('\n');
}

function buildGroupBlock(options: NormalizedOptions): string {
  return [
    '  {',
    `    label: '${tsString(options.moduleLabel)}',`,
    "    icon: 'pi pi-folder',",
    '    active: false,',
    '    items: [',
    buildItemBlock(options, GROUP_ITEM_INDENT),
    '    ]',
    '  }',
  ].join('\n');
}

/** Bloco de grupo de menu vazio (usado pelo schematic `module`). */
function buildEmptyGroupBlock(moduleLabel: string, menuIcon: string): string {
  return [
    '  {',
    `    label: '${tsString(moduleLabel)}',`,
    `    icon: '${menuIcon}',`,
    '    active: false,',
    '    items: []',
    '  }',
  ].join('\n');
}

/** Índice do `label:` de um grupo (com `items`) que corresponda ao rótulo. */
function findGroupLabelIndex(content: string, moduleLabel: string): number {
  const regex = /label:\s*'([^']*)'/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match[1] !== moduleLabel) {
      continue;
    }

    const itemsIndex = content.indexOf('items:', match.index);
    const linkIndex = content.indexOf('link:', match.index);

    if (itemsIndex !== -1 && (linkIndex === -1 || itemsIndex < linkIndex)) {
      return match.index;
    }
  }

  return -1;
}

function findMenuArrayIndex(content: string): number {
  const menuIndex = content.indexOf('MENU');

  return content.indexOf('[', content.indexOf('= [', menuIndex));
}

/** Adiciona a entrada do recurso no menu, de forma idempotente. */
export function addMenuEntry(options: NormalizedOptions): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    const path = `${options.sourceRoot}/app/core/config/menu.ts`;
    const content = readText(tree, path);

    if (content === null) {
      context.logger.warn(`Menu não encontrado em ${path}; a entrada de menu não foi adicionada.`);
      return tree;
    }

    const link = `/${options.module}/${options.resource}`;

    if (content.includes(`link: '${link}'`)) {
      context.logger.info(`Entrada de menu para ${link} já existe; nada a fazer.`);
      return tree;
    }

    const groupIndex = findGroupLabelIndex(content, options.moduleLabel);
    let updated: string;

    if (groupIndex !== -1) {
      const itemsIndex = content.indexOf('items:', groupIndex);
      const bracketIndex = content.indexOf('[', itemsIndex);
      updated = appendArrayItem(content, bracketIndex, buildItemBlock(options, GROUP_ITEM_INDENT));
    } else {
      const arrayIndex = findMenuArrayIndex(content);

      if (arrayIndex === -1) {
        context.logger.warn(`Não foi possível localizar o array MENU em ${path}; nenhuma alteração feita.`);
        return tree;
      }

      updated = appendArrayItem(content, arrayIndex, buildGroupBlock(options));
    }

    writeText(tree, path, updated);

    return tree;
  };
}

/**
 * Garante que exista um grupo de menu para o módulo (vazio), de forma
 * idempotente. Usado pelo schematic `module`.
 */
export function addMenuGroup(sourceRoot: string, moduleLabel: string, menuIcon: string): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    const path = `${sourceRoot}/app/core/config/menu.ts`;
    const content = readText(tree, path);

    if (content === null) {
      context.logger.warn(`Menu não encontrado em ${path}; o grupo de menu não foi adicionado.`);
      return tree;
    }

    if (findGroupLabelIndex(content, moduleLabel) !== -1) {
      context.logger.info(`Grupo de menu "${moduleLabel}" já existe; nada a fazer.`);
      return tree;
    }

    const arrayIndex = findMenuArrayIndex(content);

    if (arrayIndex === -1) {
      context.logger.warn(`Não foi possível localizar o array MENU em ${path}; nenhuma alteração feita.`);
      return tree;
    }

    writeText(tree, path, appendArrayItem(content, arrayIndex, buildEmptyGroupBlock(moduleLabel, menuIcon)));

    return tree;
  };
}
