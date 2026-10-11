import { chain, Rule } from '@angular-devkit/schematics';
import { buildContext } from '../utils/context';
import { applyTemplateSource, generateFiles } from '../utils/generate';
import { normalizeOptions } from '../utils/options';
import { BaseSchema, NormalizedOptions } from '../utils/types';

/** Gera a página de listagem do recurso. */
export function addList(options: NormalizedOptions): Rule {
  const context = buildContext(options);
  const dest = options.featureDir;
  const pageDir = `${dest}/pages/${options.singular}-list`;
  const sources: Rule[] = [applyTemplateSource('./files', dest, context)];
  const targets = [
    `${pageDir}/${options.singular}-list.page.ts`,
    `${pageDir}/${options.singular}-list.page.html`,
    `${pageDir}/${options.singular}-list.page.scss`,
  ];

  if (!options.skipTests) {
    sources.push(applyTemplateSource('./files-test', dest, context));
    targets.push(`${pageDir}/${options.singular}-list.page.spec.ts`);
  }

  return generateFiles(chain(sources), targets, options.force);
}

export default function list(options: BaseSchema): Rule {
  return (tree, context) => addList(normalizeOptions(options, tree))(tree, context);
}
