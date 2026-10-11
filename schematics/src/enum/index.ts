import { Rule } from '@angular-devkit/schematics';
import { addEnumFiles } from '../utils/enums';
import { normalizeOptions } from '../utils/options';
import { EnumSchema } from './schema';

/** Gera os arquivos de enumeração dos campos `enum` informados em `--fields`. */
export default function enumSchematic(options: EnumSchema): Rule {
  return (tree, context) => addEnumFiles(normalizeOptions(options, tree))(tree, context);
}
