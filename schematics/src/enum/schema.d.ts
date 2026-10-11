import { BaseSchema } from '../utils/types';

export interface EnumSchema extends BaseSchema {
  /** Módulo/feature de destino (ex.: `catalog`). */
  module: string;
  /** Recurso no singular, em kebab-case (ex.: `product-category`). */
  name: string;
  /** Campos com enum no formato `nome:enum[:Rótulo][:Classe]:VALOR=Rótulo|...`. */
  fields: string;
  /** Plural do recurso em kebab-case. */
  plural?: string;
  /** Sobrescreve arquivos existentes. */
  force?: boolean;
}
