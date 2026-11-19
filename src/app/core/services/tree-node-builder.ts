import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { FilterOperator } from '../enums/filter-operator';
import { TreeTableSelecionKey } from '../models/tree-table-selection-key';
import { RequestFiltersType } from '../types/request-filters-type';

export interface FlatTreeBuildOptions {
  /** Propriedade que identifica o registro. Padrão: `id`. */
  idKey?: string;
  /** Propriedade que aponta para o pai. Padrão: `parent_id`. */
  parentKey?: string;
  /** Propriedade usada como rótulo. Padrão: `name`. */
  labelKey?: string;
  /** Filtros que definem quais registros devem aparecer na raiz. */
  rootFilter?: RequestFiltersType;
  /** Separador das chaves hierárquicas. Padrão: `-`. */
  keySeparator?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TreeNodeBuilder {
  /**
   * Monta a árvore a partir de dados já aninhados (por exemplo
   * `Module.resources[].permissions[]`), usado pela tela de permissões.
   *
   * O nível é gravado em uma cópia do registro, evitando mutar o objeto
   * original recebido pelo componente.
   */
  public build(data: any[], level = 0, fatherKey?: string): TreeNode[] {
    const treeNodes: TreeNode[] = [];

    for (const d of data) {
      const nodeKey: string = (fatherKey ? `${fatherKey}-` : '') + String(d?.id);

      const node: TreeNode = {
        key: nodeKey,
        label: (d.label ? d.label : d?.name ?? ''),
        data: { ...d, level },
        children: [],
        checked: true
      };

      Object.keys(d).forEach(key => {
        const value = d[key];

        if (value && value !== null && Array.isArray(value) && value.length) {
          node.children = this.build(value, level + 1, nodeKey);
        }
      });

      treeNodes.push(node);
    }

    return treeNodes;
  }

  /**
   * Monta a árvore a partir de uma lista plana, relacionando os registros
   * pela propriedade que aponta para o pai (`parent_category_id`, por exemplo).
   *
   * Registros cujo pai não está presente na lista são promovidos a raiz, de
   * forma que filtros aplicados pelo usuário não deixem nós órfãos fora da
   * árvore.
   */
  public buildFromFlat(data: unknown[], options: FlatTreeBuildOptions = {}): TreeNode[] {
    const idKey = options.idKey ?? 'id';
    const parentKey = options.parentKey ?? 'parent_id';
    const labelKey = options.labelKey ?? 'name';
    const keySeparator = options.keySeparator ?? '-';
    const items: Record<string, unknown>[] = Array.isArray(data)
      ? data as Record<string, unknown>[]
      : [];

    const ids = new Set(items.map(item => String(item?.[idKey])));
    const nodes = new Map<string, TreeNode>();

    items.forEach(item => {
      const id = String(item?.[idKey]);
      nodes.set(id, {
        key: id,
        label: String(item?.[labelKey] ?? ''),
        data: { ...item },
        children: [],
        checked: true
      });
    });

    const roots: TreeNode[] = [];

    items.forEach(item => {
      const id = String(item?.[idKey]);
      const node = nodes.get(id);
      if (!node) {
        return;
      }

      const parentIdValue = item?.[parentKey];
      const parentId = parentIdValue === null || parentIdValue === undefined
        ? undefined
        : String(parentIdValue);
      const parentExists = !!parentId && parentId !== id && ids.has(parentId);
      const isRoot = options.rootFilter
        ? this.matchesFilters(item, options.rootFilter)
        : !parentExists;

      const parent = parentId ? nodes.get(parentId) : undefined;
      if (parentExists && !isRoot && parent) {
        parent.children = parent.children ?? [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    this.applyLevels(roots, 0, undefined, keySeparator, new Set<string>());
    return roots;
  }

  /**
   * Verifica se um registro plano atende a um conjunto de filtros.
   * Suporta os mesmos operadores usados nas requisições (`eq`, `ne`, `like`,
   * `gt`, `gte`, `lt`, `lte`) e caminhos aninhados (`state.name`).
   */
  public matchesFilters(record: unknown, filters?: RequestFiltersType): boolean {
    if (!filters) {
      return true;
    }

    return Object.entries(filters).every(([field, conditions]) =>
      Object.entries(conditions ?? {}).every(([operator, expected]) =>
        this.compare(this.readPath(record, field), expected, operator as FilterOperator)
      )
    );
  }

  public flattenTreeWithSelection(tree: TreeNode[], selectedKeys: string[]): Record<string, TreeTableSelecionKey> {
    if (!tree || !selectedKeys || selectedKeys.length === 0)
      return {};

    const result: Record<string, TreeTableSelecionKey> = {};
    this.processNode(tree, selectedKeys, result);
    return result;
  }

  private applyLevels(
    nodes: TreeNode[],
    level: number,
    fatherKey: string | undefined,
    keySeparator: string,
    visited: Set<string>
  ): void {
    for (const node of nodes) {
      const originalKey = node.key ?? String(node.data['id'] ?? '');

      if (visited.has(originalKey)) {
        continue;
      }
      visited.add(originalKey);

      node.key = fatherKey ? `${fatherKey}${keySeparator}${originalKey}` : originalKey;
      node.data = { ...node.data, level };

      if (node.children?.length) {
        this.applyLevels(node.children, level + 1, node.key, keySeparator, visited);
      }
    }
  }

  private processNode(nodes: TreeNode[], selectedKeys: string[], result: Record<string, TreeTableSelecionKey>): void {
    for (const node of nodes) {
      const hasChildren = node.children && node.children.length > 0;

      if (hasChildren) {
        this.processNode(node.children!, selectedKeys, result);

        const childrenKeys = node.children!.map(c => c.key!);
        const childrenResult = childrenKeys.map(k => result[k]);
        const checkedCount = childrenResult.filter(c => c?.checked).length;
        const totalCount = childrenResult.length;
        const hasPartial = childrenResult.some(c => c?.partialChecked);
        const allChecked = checkedCount === totalCount;

        result[node.key!] = {
          checked: allChecked,
          partialChecked: !allChecked && (checkedCount > 0 || hasPartial),
          level: node.data.level
        };
      } else {
        result[node.key!] = {
          checked: selectedKeys.includes(node.key!),
          partialChecked: false,
          level: node.data.level
        };
      }
    }
  }

  private compare(actual: unknown, expected: unknown, operator: FilterOperator): boolean {
    if (expected === null || expected === undefined) {
      const isEmpty = actual === null || actual === undefined;

      if (operator === FilterOperator.Equal) {
        return isEmpty;
      }
      if (operator === FilterOperator.NotEqual) {
        return !isEmpty;
      }
      return false;
    }

    if (actual === null || actual === undefined) {
      return false;
    }

    const equal = actual === expected || String(actual) === String(expected);

    switch (operator) {
      case FilterOperator.Equal:
        return equal;
      case FilterOperator.NotEqual:
        return !equal;
      case FilterOperator.Like:
        return String(actual).toLowerCase().includes(String(expected).toLowerCase());
      case FilterOperator.GreaterThan:
        return Number(actual) > Number(expected);
      case FilterOperator.GreaterThanEqual:
        return Number(actual) >= Number(expected);
      case FilterOperator.LessThan:
        return Number(actual) < Number(expected);
      case FilterOperator.LessThanEqual:
        return Number(actual) <= Number(expected);
      default:
        return false;
    }
  }

  private readPath(record: unknown, field: string): unknown {
    return field
      .split('.')
      .reduce<unknown>(
        (value: unknown, segment: string) =>
          value === null || value === undefined
            ? undefined
            : (value as Record<string, unknown>)[segment],
        record
      );
  }
}
