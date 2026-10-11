export interface MenuSchema {
  /** Módulo/feature de destino (ex.: `third-party`). */
  module: string;
  /** Recurso no singular, em kebab-case (ex.: `partner-type`). */
  name: string;
  /** Plural do recurso em kebab-case. */
  plural?: string;
  /** Rótulo plural exibido no menu. */
  'label-plural'?: string;
  /** Rótulo do grupo de menu do módulo. */
  'module-label'?: string;
  /** Ícone PrimeIcons do item de menu. */
  'menu-icon'?: string;
  /** Chave base de permissão. */
  'permission-key'?: string;
  /** Mantido por consistência. */
  force?: boolean;
}
