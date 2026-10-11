import { BaseSchema } from '../utils/types';

export interface ModuleSchema extends BaseSchema {
  /** Nome do módulo/feature, em kebab-case (ex.: `catalog`). */
  name: string;
  /** Rótulo do grupo de menu do módulo (ex.: `Catálogo`). */
  'module-label'?: string;
  /** Ícone PrimeIcons do grupo de menu. */
  'menu-icon'?: string;
  /** Não adiciona o grupo de menu do módulo. */
  'skip-menu'?: boolean;
  /** Não registra o módulo no `app.routes.ts`. */
  'skip-routes'?: boolean;
  /** Sobrescreve arquivos existentes. */
  force?: boolean;
}
