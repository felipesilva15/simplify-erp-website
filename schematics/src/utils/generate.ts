import { apply, applyTemplates, MergeStrategy, mergeWith, move, Rule, SchematicContext, Tree, url } from '@angular-devkit/schematics';
import { defaultIfEmpty, isObservable, lastValueFrom } from 'rxjs';

/**
 * Cria a rule que aplica os arquivos de `templateDir` em `dest`, usando
 * `MergeStrategy.Overwrite` para que a preservação de arquivos existentes seja
 * tratada depois pelo `generateFiles`.
 */
export function applyTemplateSource(templateDir: string, dest: string, data: object): Rule {
  return mergeWith(apply(url(templateDir), [applyTemplates(data), move(dest)]), MergeStrategy.Overwrite);
}

/**
 * Resolve o resultado de uma rule exatamente como o `callRuleAsync` do
 * devkit: lida com retornos síncronos, funções (thunks), Promises e
 * Observables, sempre devolvendo a `Tree` resultante.
 */
async function resolveRule(rule: Rule, tree: Tree, context: SchematicContext): Promise<Tree> {
  let result = await rule(tree, context);

  while (typeof result === 'function') {
    result = await result(tree, context);
  }

  if (typeof result === 'undefined') {
    return tree;
  }

  if (isObservable(result)) {
    result = await lastValueFrom(result.pipe(defaultIfEmpty(tree)));
  }

  return result as Tree;
}

/**
 * Executa `rule` e preserva arquivos já existentes (a menos que `force` seja
 * informado), avisando quais foram mantidos.
 */
export function generateFiles(rule: Rule, targetPaths: string[], force: boolean): Rule {
  return async (tree: Tree, context: SchematicContext): Promise<Tree> => {
    const preserved = new Map<string, Buffer>();

    if (!force) {
      for (const path of targetPaths) {
        const content = tree.read(path);

        if (content) {
          preserved.set(path, content);
        }
      }
    }

    const finalTree = await resolveRule(rule, tree, context);

    for (const [path, content] of preserved) {
      if (finalTree.exists(path)) {
        finalTree.overwrite(path, content);
        context.logger.warn(
          `Arquivo já existente e mantido sem alterações: ${path}. Use --force para sobrescrever.`,
        );
      }
    }

    return finalTree;
  };
}
