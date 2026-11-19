import { TestBed } from '@angular/core/testing';
import { FilterOperator } from '../enums/filter-operator';

import { TreeNodeBuilder } from './tree-node-builder';

describe('TreeNodeBuilder', () => {
  let service: TreeNodeBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeNodeBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('build', () => {
    it('should build a hierarchy from nested data', () => {
      const data = [
        {
          id: 1,
          name: 'Módulo',
          resources: [
            {
              id: 2,
              name: 'Recurso',
              permissions: [{ id: 3, name: 'Visualizar' }]
            }
          ]
        }
      ];

      const tree = service.build(data);

      expect(tree[0].key).toBe('1');
      expect(tree[0].data.level).toBe(0);
      expect(tree[0].children?.[0].key).toBe('1-2');
      expect(tree[0].children?.[0].data.level).toBe(1);
      expect(tree[0].children?.[0].children?.[0].key).toBe('1-2-3');
      expect(tree[0].children?.[0].children?.[0].data.level).toBe(2);
    });

    it('should not mutate the source records when adding level', () => {
      const data = [{ id: 1, name: 'Módulo' }];

      const tree = service.build(data);

      expect(tree[0].data).not.toBe(data[0]);
      expect((data[0] as any).level).toBeUndefined();
    });
  });

  describe('buildFromFlat', () => {
    const records = [
      { id: 1, name: 'Raiz', parent_category_id: null },
      { id: 2, name: 'Filha', parent_category_id: 1 },
      { id: 3, name: 'Neta', parent_category_id: 2 },
      { id: 4, name: 'Outra raiz', parent_category_id: null },
    ];

    it('should build a tree from a flat list', () => {
      const tree = service.buildFromFlat(records, {
        parentKey: 'parent_category_id',
        rootFilter: { parent_category_id: { [FilterOperator.Equal]: null } },
      });

      expect(tree.map(node => node.data.id)).toEqual([1, 4]);
      expect(tree[0].children?.[0].data.id).toBe(2);
      expect(tree[0].children?.[0].children?.[0].data.id).toBe(3);
      expect(tree[0].children?.[0].children?.[0].key).toBe('1-2-3');
    });

    it('should add the level to each node', () => {
      const tree = service.buildFromFlat(records, {
        parentKey: 'parent_category_id',
        rootFilter: { parent_category_id: { [FilterOperator.Equal]: null } },
      });

      expect(tree[0].data.level).toBe(0);
      expect(tree[0].children?.[0].data.level).toBe(1);
      expect(tree[0].children?.[0].children?.[0].data.level).toBe(2);
    });

    it('should promote orphans to root when there is no root filter', () => {
      const tree = service.buildFromFlat([
        { id: 2, name: 'Filha', parent_category_id: 99 },
      ], { parentKey: 'parent_category_id' });

      expect(tree).toHaveLength(1);
      expect(tree[0].data.id).toBe(2);
      expect(tree[0].data.level).toBe(0);
    });

    it('should use the configured separator for hierarchical keys', () => {
      const tree = service.buildFromFlat(records, {
        parentKey: 'parent_category_id',
        rootFilter: { parent_category_id: { [FilterOperator.Equal]: null } },
        keySeparator: '/',
      });

      expect(tree[0].children?.[0].children?.[0].key).toBe('1/2/3');
    });

    it('should not mutate the original records', () => {
      const source = records.map(record => ({ ...record }));

      const tree = service.buildFromFlat(source, {
        parentKey: 'parent_category_id',
        rootFilter: { parent_category_id: { [FilterOperator.Equal]: null } },
      });

      expect(tree[0].data).not.toBe(source[0]);
      expect(source[0]).not.toHaveProperty('level');
    });
  });

  describe('matchesFilters', () => {
    it('should match null values with the equal operator', () => {
      expect(service.matchesFilters(
        { parent_category_id: null },
        { parent_category_id: { [FilterOperator.Equal]: null } }
      )).toBe(true);
    });

    it('should match nested string values with the like operator', () => {
      expect(service.matchesFilters(
        { state: { name: 'São Paulo' } },
        { 'state.name': { [FilterOperator.Like]: 'paulo' } }
      )).toBe(true);
    });
  });
});
