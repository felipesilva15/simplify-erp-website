import { Rule } from '@angular-devkit/schematics';
import { addMenuEntry } from '../utils/menu';
import { normalizeOptions } from '../utils/options';
import { BaseSchema } from '../utils/types';

export default function menu(options: BaseSchema): Rule {
  return (tree, context) => addMenuEntry(normalizeOptions(options, tree))(tree, context);
}
