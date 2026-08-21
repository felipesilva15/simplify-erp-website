import { Position } from "../enums/position";

export interface DrawerConfig<D = any> {
  /** Dados repassados ao componente carregado, análogo ao data do DynamicDialogConfig */
  data?: D;

  /** Espelham inputs nativos do p-drawer */
  header?: string;
  position?: Position;
  size?: string;              // ex: '30rem', '480px'
  modal?: boolean;            // default true
  dismissible?: boolean;      // fecha ao clicar fora (default true)
  closeOnEscape?: boolean;    // default true
  showCloseIcon?: boolean;    // default true

  styleClass?: string;
  style?: { [key: string]: string };

  /** Sobrescreve o cálculo automático de camada feito pelo service */
  baseZIndex?: number;

  /** Impede empilhar outro drawer por cima deste enquanto ele estiver aberto */
  blocking?: boolean;
}