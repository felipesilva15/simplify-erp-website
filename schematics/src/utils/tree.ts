import { Tree } from '@angular-devkit/schematics';

/** Lê o conteúdo textual de um arquivo da árvore, ou `null` se não existir. */
export function readText(tree: Tree, path: string): string | null {
  const buffer = tree.read(path);

  return buffer ? buffer.toString('utf-8') : null;
}

/** Cria ou sobrescreve um arquivo na árvore. */
export function writeText(tree: Tree, path: string, content: string): void {
  if (tree.exists(path)) {
    tree.overwrite(path, content);
  } else {
    tree.create(path, content);
  }
}
