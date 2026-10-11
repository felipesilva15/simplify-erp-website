const CLOSERS: Readonly<Record<string, string>> = {
  '{': '}',
  '[': ']',
  '(': ')',
};

/**
 * Encontra o índice do delimitador de fechamento correspondente a
 * `openIndex`. Ignora conteúdo dentro de strings (`'`, `"`, `` ` ``) e
 * comentários de linha para evitar falsos positivos.
 */
export function findMatchingIndex(text: string, openIndex: number): number {
  const open = text[openIndex];
  const close = CLOSERS[open];

  if (!close) {
    throw new Error(`Caractere "${open}" não é um delimitador válido.`);
  }

  let depth = 0;
  let quote: string | null = null;

  for (let index = openIndex; index < text.length; index++) {
    const char = text[index];

    if (quote) {
      if (char === '\\') {
        index++;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }

    if (char === '/' && text[index + 1] === '/') {
      const lineEnd = text.indexOf('\n', index);
      index = lineEnd === -1 ? text.length : lineEnd;
      continue;
    }

    if (char === open) {
      depth++;
      continue;
    }

    if (char === close) {
      depth--;

      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error('Delimitador de fechamento não encontrado.');
}

/**
 * Acrescenta um item ao final de um array identificado pelo índice do `[`.
 * Garante a vírgula no último elemento anterior e preserva a linha do `]`.
 */
export function appendArrayItem(text: string, openIndex: number, itemBlock: string): string {
  const closeIndex = findMatchingIndex(text, openIndex);
  const closeLineStart = text.lastIndexOf('\n', closeIndex) + 1;

  let head = text.slice(0, closeLineStart);
  const tail = text.slice(closeLineStart);
  const trimmed = head.replace(/\s+$/, '');

  if (trimmed.length > 0 && !trimmed.endsWith(',')) {
    head = `${trimmed},${head.slice(trimmed.length)}`;
  }

  return `${head}${itemBlock}\n${tail}`;
}

/** Insere uma linha de import logo após o último `import ...;` do arquivo. */
export function insertAfterLastImport(text: string, importLine: string): string {
  const regex = /^import .*;$/gm;
  let match: RegExpExecArray | null;
  let lastIndex = -1;

  while ((match = regex.exec(text)) !== null) {
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex === -1) {
    return `${importLine}\n${text}`;
  }

  return `${text.slice(0, lastIndex)}\n${importLine}${text.slice(lastIndex)}`;
}

/** Insere `content` imediatamente antes da linha que contém o índice informado. */
export function insertBeforeLine(text: string, index: number, content: string): string {
  const lineStart = text.lastIndexOf('\n', index) + 1;

  return `${text.slice(0, lineStart)}${content}\n${text.slice(lineStart)}`;
}

/** Escapa caracteres especiais de regex em um texto literal. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
