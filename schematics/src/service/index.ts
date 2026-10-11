import { chain, Rule } from '@angular-devkit/schematics';
import { buildContext } from '../utils/context';
import { applyTemplateSource, generateFiles } from '../utils/generate';
import { normalizeOptions } from '../utils/options';
import { BaseSchema, NormalizedOptions } from '../utils/types';

/** Gera o service do recurso. */
export function addService(options: NormalizedOptions): Rule {
  const context = buildContext(options);
  const dest = options.featureDir;
  const sources: Rule[] = [applyTemplateSource('./files', dest, context)];
  const targets = [`${dest}/services/${options.singular}-service.ts`];

  if (!options.skipTests) {
    sources.push(applyTemplateSource('./files-test', dest, context));
    targets.push(`${dest}/services/${options.singular}-service.spec.ts`);
  }

  return generateFiles(chain(sources), targets, options.force);
}

export default function service(options: BaseSchema): Rule {
  return (tree, context) => addService(normalizeOptions(options, tree))(tree, context);
}
