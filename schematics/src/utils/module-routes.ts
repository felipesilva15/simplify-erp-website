import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { appendArrayItem, escapeRegExp } from './text';
import { readText, writeText } from './tree';
import { NormalizedOptions } from './types';

/** Dados mínimos para registrar um módulo no `app.routes.ts`. */
export interface ModuleRegistration {
  sourceRoot: string;
  /** Módulo em kebab-case (pode conter `/`). */
  module: string;
  /** Constante exportada pelo arquivo `<módulo>.routes.ts`. */
  moduleRoutesConst: string;
}

function buildRouteEntry(options: NormalizedOptions, indent: number): string {
  const pad = ' '.repeat(indent);
  const inner = ' '.repeat(indent + 4);

  return [
    `${pad}{`,
    `${inner}path: '${options.resource}',`,
    `${inner}loadChildren: () => import('./${options.resource}/${options.resource}.routes').then(r => r.${options.routesConst})`,
    `${pad}}`,
  ].join('\n');
}

function createModuleRoutesFile(options: NormalizedOptions): string {
  return [
    "import { Routes } from '@angular/router';",
    '',
    `export const ${options.moduleRoutesConst}: Routes = [`,
    buildRouteEntry(options, 4),
    '];',
    '',
  ].join('\n');
}

/** Localiza o índice do `[` que abre o array de rotas do módulo. */
function findModuleArrayIndex(content: string, moduleRoutesConst: string): number {
  const declaration = content.indexOf(`const ${moduleRoutesConst}`);
  const searchFrom = declaration === -1 ? 0 : declaration;
  const assignment = content.indexOf('= [', searchFrom);

  if (assignment === -1) {
    return -1;
  }

  return content.indexOf('[', assignment);
}

/** Registra o módulo no array de rotas filhas do layout principal. */
export function registerModuleInAppRoutes(
  tree: Tree,
  context: SchematicContext,
  registration: ModuleRegistration,
): Tree {
  const path = `${registration.sourceRoot}/app/app.routes.ts`;
  const content = readText(tree, path);

  if (content === null) {
    context.logger.warn(`app.routes.ts não encontrado em ${path}; registre o módulo "${registration.module}" manualmente.`);
    return tree;
  }

  if (new RegExp(`path:\\s*'${escapeRegExp(registration.module)}'`).test(content)) {
    return tree;
  }

  const layoutIndex = content.indexOf('MainLayout');
  const childrenIndex = content.indexOf('children: [', layoutIndex === -1 ? 0 : layoutIndex);

  if (childrenIndex === -1) {
    context.logger.warn(
      `Não foi possível registrar o módulo "${registration.module}" em ${path}; faça-o manualmente.`,
    );
    return tree;
  }

  const bracketIndex = content.indexOf('[', childrenIndex);
  const entry = [
    '            {',
    `                path: '${registration.module}',`,
    `                loadChildren: () => import('./features/${registration.module}/${registration.module}.routes').then(r => r.${registration.moduleRoutesConst})`,
    '            }',
  ].join('\n');

  writeText(tree, path, appendArrayItem(content, bracketIndex, entry));

  return tree;
}

/**
 * Registra o recurso no arquivo `<módulo>.routes.ts`, criando-o (e
 * registrando o módulo em `app.routes.ts`) quando ainda não existir.
 */
export function registerResourceRoutes(options: NormalizedOptions): Rule {
  return (tree: Tree, context: SchematicContext): Tree => {
    const path = `${options.sourceRoot}/app/features/${options.module}/${options.module}.routes.ts`;
    const content = readText(tree, path);

    if (content === null) {
      writeText(tree, path, createModuleRoutesFile(options));
      registerModuleInAppRoutes(tree, context, {
        sourceRoot: options.sourceRoot,
        module: options.module,
        moduleRoutesConst: options.moduleRoutesConst,
      });

      return tree;
    }

    if (new RegExp(`path:\\s*'${escapeRegExp(options.resource)}'`).test(content)) {
      context.logger.info(`Rota "${options.resource}" já registrada em ${path}; nada a fazer.`);
      return tree;
    }

    const bracketIndex = findModuleArrayIndex(content, options.moduleRoutesConst);

    if (bracketIndex === -1) {
      context.logger.warn(
        `Não foi possível localizar o array de rotas de "${options.moduleRoutesConst}" em ${path}; registre a rota manualmente.`,
      );
      return tree;
    }

    writeText(tree, path, appendArrayItem(content, bracketIndex, buildRouteEntry(options, 4)));

    return tree;
  };
}
