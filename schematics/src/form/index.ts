import { chain, Rule } from '@angular-devkit/schematics';
import { buildContext } from '../utils/context';
import { applyTemplateSource, generateFiles } from '../utils/generate';
import { normalizeOptions } from '../utils/options';
import { BaseSchema, NormalizedOptions } from '../utils/types';

/** Gera o formulário (dialog ou page) do recurso. */
export function addForm(options: NormalizedOptions): Rule {
  const context = buildContext(options);
  const dest = options.featureDir;
  const variant = options.formType;
  const base = `${dest}/pages/${options.singular}-form`;
  const extension = variant === 'page' ? 'page' : 'dialog';
  const sources: Rule[] = [applyTemplateSource(`./files/${variant}`, dest, context)];
  const targets = [
    `${base}/${options.singular}-form.${extension}.ts`,
    `${base}/${options.singular}-form.${extension}.html`,
    `${base}/${options.singular}-form.${extension}.scss`,
  ];

  if (!options.skipTests) {
    sources.push(applyTemplateSource(`./files-test/${variant}`, dest, context));
    targets.push(`${base}/${options.singular}-form.${extension}.spec.ts`);
  }

  return generateFiles(chain(sources), targets, options.force);
}

export default function form(options: BaseSchema): Rule {
  return (tree, context) => addForm(normalizeOptions(options, tree))(tree, context);
}
