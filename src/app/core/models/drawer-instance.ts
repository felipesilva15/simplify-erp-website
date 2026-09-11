import { Type, WritableSignal } from "@angular/core";
import { DrawerConfig } from "./drawer-config";
import { DrawerRef } from "../lib/drawer-ref";

export interface DrawerInstance<T = any, D = any> {
  /** Componente a ser instanciado dinamicamente dentro do p-drawer */
  component: Type<T>;

  /** Config original passada no open() */
  config: DrawerConfig<D>;

  /** Handle de controle/comunicação, injetado no componente filho */
  ref: DrawerRef;

  /** Z-index já resolvido pelo service para esta posição na pilha */
  zIndex: number;

  /** Nível na pilha (0 = primeiro drawer aberto), útil para debug/estilo condicional */
  level: number;

  /** Visibilidade do drawer, controla a animação de entrada/saída do p-drawer */
  visible: WritableSignal<boolean>;
}