import { chain, Rule } from '@angular-devkit/schematics';
import { buildContext } from '../utils/context';
import { applyTemplateSource, generateFiles } from '../utils/generate';
import { normalizeOptions } from '../utils/options';
import { BaseSchema, NormalizedOptions } from '../utils/types';

/** Gera o componente de lookup do recurso. */
export function addLookup(options: NormalizedOptions): Rule {
  const context = buildContext(options);
  const dest = options.featureDir;
  const base = `${dest}/components/${options.singular}-lookup`;
  const sources: Rule[] = [applyTemplateSource('./files', dest, context)];
  const targets = [
    `${base}/${options.singular}-lookup.component.ts`,
    `${base}/${options.singular}-lookup.component.html`,
    `${base}/${options.singular}-lookup.component.scss`,
  ];

  if (!options.skipTests) {
    sources.push(applyTemplateSource('./files-test', dest, context));
    targets.push(`${base}/${options.singular}-lookup.component.spec.ts`);
  }

  return generateFiles(chain(sources), targets, options.force);
}

export default function lookup(options: BaseSchema): Rule {
  return (tree, context) => addLookup(normalizeOptions(options, tree))(tree, context);
}
