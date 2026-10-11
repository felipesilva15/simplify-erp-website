import { chain, noop, Rule, schematic } from '@angular-devkit/schematics';
import { normalizeOptions } from '../utils/options';
import { BaseSchema } from '../utils/types';

/**
 * Gera um CRUD completo (model, service, lookup, listagem, formulário, rotas e
 * menu) para um recurso de um módulo existente.
 *
 * Cada etapa roda como sub-schematic para que os caminhos relativos dos
 * templates (`url('./files')`) sejam resolvidos no diretório correto.
 */
export default function crud(options: BaseSchema): Rule {
  return (tree, context) => {
    const normalized = normalizeOptions(options, tree);
    const subOptions: BaseSchema = { ...options };

    return chain([
      schematic('model', subOptions),
      schematic('service', subOptions),
      normalized.skipLookup ? noop() : schematic('lookup', subOptions),
      schematic('list', subOptions),
      schematic('form', subOptions),
      normalized.skipRoutes ? noop() : schematic('routes', subOptions),
      normalized.skipMenu ? noop() : schematic('menu', subOptions),
    ])(tree, context);
  };
}
