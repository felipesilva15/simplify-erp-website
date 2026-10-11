export interface ExportSchema {
  /** Módulo/feature de destino (ex.: `third-party`). */
  module: string;
  /** Recurso no singular, em kebab-case (ex.: `partner-type`). */
  name: string;
  /** Plural do recurso em kebab-case. */
  plural?: string;
  /** Mantido por consistência. */
  force?: boolean;
}
