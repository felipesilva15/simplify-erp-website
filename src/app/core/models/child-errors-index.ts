import { ChildRowErrors } from './child-row-errors';

/**
 * Erros de uma lista de itens filhos, indexados pela chave estável da linha
 * (e não pelo índice), para que remoções e recargas não desloquem os erros de
 * um item para outro.
 */
export type ChildErrorsIndex = Record<number, ChildRowErrors>;
