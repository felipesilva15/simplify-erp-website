export interface ServiceSchema {
  /** Módulo/feature de destino (ex.: `third-party`). */
  module: string;
  /** Recurso no singular, em kebab-case (ex.: `partner-type`). */
  name: string;
  /** Plural do recurso em kebab-case. */
  plural?: string;
  /** Implementa `ExportableService` (método `export`). */
  'with-export'?: boolean;
  /** Implementa `LogableService` (método `activityLogs`). */
  'with-log'?: boolean;
  /** Não implementa `LookupService` (método `search`). */
  'skip-lookup'?: boolean;
  /** Não gera arquivos de teste. */
  'skip-tests'?: boolean;
  /** Sobrescreve arquivos existentes. */
  force?: boolean;
}
