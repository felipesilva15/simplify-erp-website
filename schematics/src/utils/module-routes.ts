import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { appendArrayItem, escapeRegExp } from './text';
import { readText, writeText } from './tree';
import { NormalizedOptions } from './types';

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

/** Registra o módulo no array de rotas filhas do layout principal. */
function registerModuleInAppRoutes(tree: Tree, context: SchematicContext, options: NormalizedOptions): void {
  const path = `${options.sourceRoot}/app/app.routes.ts`;
  const content = readText(tree, path);

  if (content === null) {
    context.logger.warn(`app.routes.ts não encontrado em ${path}; registre o módulo "${options.module}" manualmente.`);
    return;
  }

  if (new RegExp(`path:\\s*'${escapeRegExp(options.module)}'`).test(content)) {
    return;
  }

  const layoutIndex = content.indexOf('MainLayout');
  const childrenIndex = content.indexOf('children: [', layoutIndex === -1 ? 0 : layoutIndex);

  if (childrenIndex === -1) {
    context.logger.warn(
      `Não foi possível registrar o módulo "${options.module}" em ${path}; faça-o manualmente.`,
    );
    return;
  }

  const bracketIndex = content.indexOf('[', childrenIndex);
  const entry = [
    '            {',
    `                path: '${options.module}',`,
    `                loadChildren: () => import('./features/${options.module}/${options.module}.routes').then(r => r.${options.moduleRoutesConst})`,
    '            }',
  ].join('\n');

  writeText(tree, path, appendArrayItem(content, bracketIndex, entry));
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
      registerModuleInAppRoutes(tree, context, options);

      return tree;
    }

    if (new RegExp(`path:\\s*'${escapeRegExp(options.resource)}'`).test(content)) {
      context.logger.info(`Rota "${options.resource}" já registrada em ${path}; nada a fazer.`);
      return tree;
    }

    const exportIndex = content.indexOf(options.moduleRoutesConst);

    if (exportIndex === -1) {
      context.logger.warn(`Não foi possível localizar "${options.moduleRoutesConst}" em ${path}; registre a rota manualmente.`);
      return tree;
    }

    const bracketIndex = content.indexOf('[', content.indexOf('= [', exportIndex));

    if (bracketIndex === -1) {
      context.logger.warn(`Não foi possível localizar o array de rotas em ${path}; registre a rota manualmente.`);
      return tree;
    }

    writeText(tree, path, appendArrayItem(content, bracketIndex, buildRouteEntry(options, 4)));

    return tree;
  };
}
