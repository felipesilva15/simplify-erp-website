import { BaseSchema } from '../utils/types';

export interface CrudSchema extends BaseSchema {
  /** Módulo/feature de destino (ex.: `third-party`). */
  module: string;
  /** Recurso no singular, em kebab-case (ex.: `partner-type`). */
  name: string;
}
