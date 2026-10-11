export interface ModelSchema {
  /** Módulo/feature de destino (ex.: `third-party`). */
  module: string;
  /** Recurso no singular, em kebab-case (ex.: `partner-type`). */
  name: string;
  /** Campos no formato `nome:tipo[:Rótulo]`. */
  fields?: string;
  /** Plural do recurso em kebab-case. */
  plural?: string;
  /** Sobrescreve arquivos existentes. */
  force?: boolean;
}
