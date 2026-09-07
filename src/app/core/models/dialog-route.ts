import { Type } from '@angular/core';
import { DynamicDialogConfig } from './dynamic-dialog-config';

/** Definição de um dialog acessível por rota, declarada em `route.data['dialog']`. */
export interface DialogRoute<D = any> {
  /** Componente a ser exibido dentro do dialog quando a rota for acessada. */
  component: Type<any>;

  /** Configuração do dialog (título, tamanho, dados, etc.). Os `params` da rota são mesclados em `config.data`. */
  config?: DynamicDialogConfig<D>;

  /** Caminho para onde navegar após fechar o dialog. Default: `'..'` (rota pai) relativo à rota do dialog. */
  backPath?: string | any[];
}
