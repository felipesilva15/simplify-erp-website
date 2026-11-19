import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MenuItemCommandEvent } from 'primeng/api';
import { vi } from 'vitest';
import { BaseEntity } from '../../../core/models/base-entity';
import { ColumnType } from '../../../core/enums/column-type';
import { FilterOperator } from '../../../core/enums/filter-operator';
import { TreeListConfig } from '../../../core/models/tree-list-config';
import { TreeTableColumn } from '../../../core/models/tree-table-column';
import { CrudListFacade } from '../../facades/crud-list.facade';
import { TreeCrudListComponent } from './tree-crud-list.component';

describe('TreeCrudListComponent', () => {
  let component: TreeCrudListComponent<BaseEntity>;
  let fixture: ComponentFixture<TreeCrudListComponent<BaseEntity>>;
  let facade: any;

  const cols: TreeTableColumn[] = [
    { field: 'id', header: 'ID', type: ColumnType.Integer },
    { field: 'name', header: 'Nome', type: ColumnType.Text },
  ];

  const treeConfig: TreeListConfig = {
    idKey: 'id',
    parentKey: 'parent_category_id',
    labelKey: 'name',
    rootFilter: { parent_category_id: { [FilterOperator.Equal]: null } },
  };

  const records = [
    { id: 1, name: 'Raiz', parent_category_id: null },
    { id: 2, name: 'Filha', parent_category_id: 1 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeCrudListComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    facade = {
      data: vi.fn().mockReturnValue(records),
      loading: vi.fn().mockReturnValue(false),
      requestParams: vi.fn().mockReturnValue(undefined),
      fixedFilters: vi.fn().mockReturnValue(treeConfig.rootFilter),
      filterDefinitionVisible: vi.fn().mockReturnValue(false),
      exportMenu: vi.fn().mockReturnValue([]),
      canCreate: vi.fn().mockReturnValue(true),
      can: vi.fn().mockReturnValue(true),
      load: vi.fn(),
      applySearch: vi.fn(),
      applyFilters: vi.fn(),
      fitlersVisibleChange: vi.fn(),
      openFilters: vi.fn(),
    };

    fixture = TestBed.createComponent(TreeCrudListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cols', cols);
    fixture.componentRef.setInput('facade', facade as CrudListFacade<any>);
    fixture.componentRef.setInput('treeConfig', treeConfig);
    fixture.componentRef.setInput('searchDelay', 0);
    fixture.detectChanges();
  });

  it('should create and load data from the facade', () => {
    expect(component).toBeTruthy();
    expect(facade.load).toHaveBeenCalledTimes(1);
  });

  it('should build the tree from the flat list using the configured keys', () => {
    expect(component.nodes().map(node => node.data.id)).toEqual([1]);
    expect(component.nodes()[0].children?.[0].data.id).toBe(2);
    expect(component.nodes()[0].children?.[0].key).toBe('1-2');
  });

  it('should add default date filter definitions', () => {
    expect(component.filterFieldDefinition().map(field => field.name)).toEqual([
      'created_at',
      'updated_at'
    ]);
  });

  it('should debounce and delegate search to the facade', async () => {
    component.onSearchInput('categoria');

    await new Promise(resolve => setTimeout(resolve, 20));

    expect(facade.applySearch).toHaveBeenCalledWith('categoria');
  });

  it('should build the context menu for the right-clicked record', () => {
    const action = vi.fn();
    fixture.componentRef.setInput('tableMenu', [
      { label: 'Editar', permission: 'productCategories.edit', action }
    ]);
    facade.can.mockReturnValue(true);
    const record = { id: 2, name: 'Filha', parent_category_id: 1 };

    component.onContextMenuSelect({ event: new Event('contextmenu'), record });

    expect(component.menuItems).toHaveLength(1);
    expect(component.menuItems[0].label).toBe('Editar');
    component.menuItems[0].command?.({} as MenuItemCommandEvent);
    expect(action).toHaveBeenCalledWith(record);
  });
});
