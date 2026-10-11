import { chain, Rule } from '@angular-devkit/schematics';
import { buildContext } from '../utils/context';
import { applyTemplateSource, generateFiles } from '../utils/generate';
import { registerResourceRoutes } from '../utils/module-routes';
import { normalizeOptions } from '../utils/options';
import { BaseSchema, NormalizedOptions } from '../utils/types';

/** Gera as rotas do recurso e as registra no módulo. */
export function addRoutes(options: NormalizedOptions): Rule {
  const context = buildContext(options);
  const source = applyTemplateSource(`./files/${options.formType}`, options.featureDir, context);
  const target = `${options.featureDir}/${options.resource}.routes.ts`;

  return chain([generateFiles(source, [target], options.force), registerResourceRoutes(options)]);
}

export default function routes(options: BaseSchema): Rule {
  return (tree, context) => addRoutes(normalizeOptions(options, tree))(tree, context);
}
