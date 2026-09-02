import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class TreeNodeBuilder {
  public build(data: any[], level: number = 0, fatherKey?: string): TreeNode[] {
    const treeNodes: TreeNode[] = [];

    for (const d of data) {
      const nodeKey: string = (fatherKey ? `${fatherKey}-` : '') + String(d?.id)
      d.level = level;

      const node: TreeNode = {
        key: nodeKey,
        label: (d.label ? d.label ?? '' : d?.name ?? ''),
        data: d,
        children: [],
        checked: true
      };

      Object.keys(d).forEach(key => {
        const value = d[key];

        if (value && value !== null && Array.isArray(value) && value.length) {
          const children: TreeNode[] = this.build(value, level + 1, nodeKey);
          node.children = children;
        }
      });

      treeNodes.push(node);
    }

    return treeNodes;
  }

  public flattenTreeWithSelection(tree: TreeNode[], selectedKeys: string[]): Record<string, { checked: boolean; partialChecked: boolean }> {
    if (!tree || !selectedKeys || selectedKeys.length === 0)
      return {};

    const result: Record<string, { checked: boolean; partialChecked: boolean }> = {};
    this.processNode(tree, selectedKeys, result);
    return result;
  }

  private processNode(nodes: TreeNode[], selectedKeys: string[], result: Record<string, { checked: boolean; partialChecked: boolean }>): void {
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
          partialChecked: !allChecked && (checkedCount > 0 || hasPartial)
        };
      } else {
        result[node.key!] = {
          checked: selectedKeys.includes(node.key!),
          partialChecked: false
        };
      }
    }
  }
}
