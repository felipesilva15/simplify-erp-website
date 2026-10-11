export interface ListSchema {
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
  /** Rótulo plural em pt-BR. */
  'label-plural'?: string;
  /** Rótulo do módulo usado no breadcrumb. */
  'module-label'?: string;
  /** Chave base de permissão. */
  'permission-key'?: string;
  /** Formato do formulário associado. */
  'form-type'?: 'dialog' | 'page';
  /** Inclui as opções de exportação. */
  'with-export'?: boolean;
  /** Não gera arquivos de teste. */
  'skip-tests'?: boolean;
  /** Sobrescreve arquivos existentes. */
  force?: boolean;
}
