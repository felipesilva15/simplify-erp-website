import { chain, noop, Rule, SchematicContext, strings, Tree } from '@angular-devkit/schematics';
import { applyTemplateSource, generateFiles } from '../utils/generate';
import { addMenuGroup } from '../utils/menu';
import { registerModuleInAppRoutes } from '../utils/module-routes';
import { normalizeModuleOptions } from '../utils/options';
import { NormalizedModuleOptions } from '../utils/types';
import { ModuleSchema } from './schema';

/** Cria a pasta do módulo, o arquivo de rotas vazio e o registro no app.routes/menu. */
export function addModule(options: NormalizedModuleOptions): Rule {
  const segments = options.module.split('/');
  const lastSegment = segments[segments.length - 1];
  const templateContext = {
    name: lastSegment,
    moduleRoutesConst: options.moduleRoutesConst,
    dasherize: strings.dasherize,
  };
  const source = applyTemplateSource('./files', options.moduleDir, templateContext);

  return chain([
    generateFiles(source, [`${options.moduleDir}/${lastSegment}.routes.ts`], options.force),
    options.skipRoutes
      ? noop()
      : (tree: Tree, context: SchematicContext) =>
          registerModuleInAppRoutes(tree, context, {
            sourceRoot: options.sourceRoot,
            module: options.module,
            moduleRoutesConst: options.moduleRoutesConst,
          }),
    options.skipMenu ? noop() : addMenuGroup(options.sourceRoot, options.moduleLabel, options.menuIcon),
  ]);
}

export default function module(options: ModuleSchema): Rule {
  return (tree, context) => addModule(normalizeModuleOptions(options, tree))(tree, context);
}
