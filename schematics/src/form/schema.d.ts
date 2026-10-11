export interface FormSchema {
  /** Módulo/feature de destino (ex.: `third-party`). */
  module: string;
  /** Recurso no singular, em kebab-case (ex.: `partner-type`). */
  name: string;
  /** Campos no formato `nome:tipo[:Rótulo]`. */
  fields?: string;
  /** Plural do recurso em kebab-case. */
  plural?: string;
  /** Rótulo singular em pt-BR. */
  label?: string;
  /** Formato do formulário. */
  'form-type'?: 'dialog' | 'page';
  /** Não gera arquivos de teste. */
  'skip-tests'?: boolean;
  /** Sobrescreve arquivos existentes. */
  force?: boolean;
}
