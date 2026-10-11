export interface RoutesSchema {
  /** Módulo/feature de destino (ex.: `third-party`). */
  module: string;
  /** Recurso no singular, em kebab-case (ex.: `partner-type`). */
  name: string;
  /** Plural do recurso em kebab-case. */
  plural?: string;
  /** Rótulo singular em pt-BR. */
  label?: string;
  /** Chave base de permissão. */
  'permission-key'?: string;
  /** Formato do formulário associado às rotas. */
  'form-type'?: 'dialog' | 'page';
  /** Sobrescreve arquivos existentes. */
  force?: boolean;
}
