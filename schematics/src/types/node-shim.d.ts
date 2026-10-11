/*
 * Declarações ambientais mínimas para os globais do Node referenciados pelos
 * tipos de `@angular-devkit/schematics` (ex.: `Buffer`). Evita adicionar
 * `@types/node` como dependência do repositório, mantendo a collection isolada.
 */
declare class Buffer extends Uint8Array {
  toString(encoding?: string, start?: number, end?: number): string;
  static from(input: string, encoding?: string): Buffer;
}

declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
  argv: string[];
};
