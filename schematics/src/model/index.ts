import { chain, Rule } from '@angular-devkit/schematics';
import { buildContext } from '../utils/context';
import { addEnumFiles } from '../utils/enums';
import { applyTemplateSource, generateFiles } from '../utils/generate';
import { normalizeOptions } from '../utils/options';
import { BaseSchema, NormalizedOptions } from '../utils/types';

/** Gera apenas o model do recurso. */
export function addModel(options: NormalizedOptions): Rule {
  const context = buildContext(options);
  const source = applyTemplateSource('./files', options.featureDir, context);
  const target = `${options.featureDir}/models/${options.singular}.ts`;

  return chain([addEnumFiles(options), generateFiles(source, [target], options.force)]);
}

export default function model(options: BaseSchema): Rule {
  return (tree, context) => addModel(normalizeOptions(options, tree))(tree, context);
}
