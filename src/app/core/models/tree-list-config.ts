import { RequestFiltersType } from '../types/request-filters-type';

/**
 * Configuração declarativa de uma listagem em árvore.
 *
 * Não conhece nenhuma entidade específica: as chaves são informadas pela página
 * que usa o componente, permitindo reutilizar a mesma tabela para qualquer
 * modelo (lista plana com `parentId` ou dados já aninhados).
 */
export interface TreeListConfig {
  /** Propriedade que identifica o registro. Padrão: `id`. */
  idKey?: string;
  /** Propriedade que aponta para o registro pai em uma lista plana. */
  parentKey?: string;
  /** Propriedade usada como rótulo do nó. Padrão: `name`. */
  labelKey?: string;
  /**
   * Filtros fixos usados para determinar quais registros são raízes.
   * Quando informado, tem precedência sobre `parentKey` vazio/nulo.
   */
  rootFilter?: RequestFiltersType;
  /** Cores de fundo aplicadas às linhas de acordo com o nível. */
  levelColors?: Record<number, string>;
  /** Expande todos os nós quando a árvore é montada. */
  expandAll?: boolean;
  /** Separador usado nas chaves hierárquicas. Padrão: `-`. */
  keySeparator?: string;
}
