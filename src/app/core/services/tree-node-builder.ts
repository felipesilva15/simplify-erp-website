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
        children: []
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
}
