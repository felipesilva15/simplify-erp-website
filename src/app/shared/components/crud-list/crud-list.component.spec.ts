import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { CrudListComponent } from './crud-list.component';
import { CrudListFacade } from '../../facades/crud-list.facade';
import { TableColumn } from '../../../core/models/table-column';
import { ColumnType } from '../../../core/enums/column-type';
import { BaseEntity } from '../../../core/models/base-entity';

interface TestEntity extends BaseEntity {
  name: string;
  value: number;
  date: Date;
}

function createMockFacade() {
  return {
    data: vi.fn().mockReturnValue([]),
    totalRecords: vi.fn().mockReturnValue(0),
    loading: vi.fn().mockReturnValue(false),
    filterDefinitionVisible: vi.fn().mockReturnValue(false),
    requestParams: vi.fn().mockReturnValue(undefined),
    canCreate: vi.fn().mockReturnValue(true),
    load: vi.fn(),
    openFilters: vi.fn(),
    applyFilters: vi.fn(),
    fitlersVisibleChange: vi.fn(),
    can: vi.fn().mockReturnValue(true),
    applyLazyLoad: vi.fn(),
  };
}

describe('CrudListComponent', () => {
  let component: CrudListComponent<any>;
  let fixture: ComponentFixture<CrudListComponent<any>>;
  let facade: ReturnType<typeof createMockFacade>;

  const defaultCols: TableColumn<TestEntity>[] = [
    { field: 'name', header: 'Name', sortable: true, type: ColumnType.TEXT },
    { field: 'value', header: 'Value', type: ColumnType.CURRENCY },
  ];

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(async () => {
    facade = createMockFacade();

    await TestBed.configureTestingModule({
      imports: [CrudListComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: vi.fn() } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudListComponent);
    component = fixture.componentInstance;
    component.cols = [...defaultCols];
    component.facade = facade as any;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set columnCount based on cols length', () => {
      fixture.detectChanges();
      expect(component.columnCount()).toBe(2);
    });

    it('should add selection column to columnCount when enableSelection is true', () => {
      fixture.componentRef.setInput('enableSelection', true);
      fixture.detectChanges();
      expect(component.columnCount()).toBe(3);
    });

    it('should call facade.load when lazyLoadEnabled is false', () => {
      fixture.componentRef.setInput('lazyLoadEnabled', false);
      fixture.detectChanges();
      expect(facade.load).toHaveBeenCalledTimes(1);
    });

    it('should not call facade.load when lazyLoadEnabled is true', () => {
      fixture.detectChanges();
      expect(facade.load).not.toHaveBeenCalled();
    });

    it('should add default filter field definitions', () => {
      fixture.detectChanges();
      const filters = component.filterFieldDefinition();
      expect(filters.length).toBe(2);
      expect(filters[0]).toEqual({
        name: 'created_at',
        label: 'Criado em',
        type: ColumnType.DATETIME,
      });
      expect(filters[1]).toEqual({
        name: 'updated_at',
        label: 'Atualizado em',
        type: ColumnType.DATETIME,
      });
    });
  });

  describe('formatRowValue', () => {
    it('should return value as-is for column without type or pipe', () => {
      const col: TableColumn<TestEntity> = { field: 'name', header: 'Name' };
      expect(component.formatRowValue({ name: 'test' }, col)).toBe('test');
    });

    it('should return empty string for null value when no type', () => {
      const col: TableColumn<TestEntity> = { field: 'name', header: 'Name' };
      expect(component.formatRowValue({ name: null }, col)).toBe('');
    });

    it('should return empty string for undefined value when no type', () => {
      const col: TableColumn<TestEntity> = { field: 'name', header: 'Name' };
      expect(component.formatRowValue({}, col)).toBe('');
    });

    it('should use pipe.transform when column has a pipe', () => {
      const mockTransform = vi.fn().mockReturnValue('formatted');
      const col: TableColumn<TestEntity> = {
        field: 'name',
        header: 'Name',
        pipe: { transform: mockTransform } as any,
      };
      const result = component.formatRowValue({ name: 'test' }, col);
      expect(mockTransform).toHaveBeenCalledWith('test');
      expect(result).toBe('formatted');
    });

    it('should pass pipeArgs to pipe.transform', () => {
      const mockTransform = vi.fn().mockReturnValue('formatted');
      const col: TableColumn<TestEntity> = {
        field: 'name',
        header: 'Name',
        pipe: { transform: mockTransform } as any,
        pipeArgs: ['arg1', 'arg2'],
      };
      component.formatRowValue({ name: 'test' }, col);
      expect(mockTransform).toHaveBeenCalledWith('test', 'arg1', 'arg2');
    });

    it('should format DATE type with datePipe', () => {
      const col: TableColumn<TestEntity> = {
        field: 'date',
        header: 'Date',
        type: ColumnType.DATE,
      };
      const result = component.formatRowValue(
        { date: new Date(2024, 0, 15) },
        col,
      );
      expect(result).toBe('15/01/2024');
    });

    it('should return empty string for null DATE value', () => {
      const col: TableColumn<TestEntity> = {
        field: 'date',
        header: 'Date',
        type: ColumnType.DATE,
      };
      expect(component.formatRowValue({ date: null }, col)).toBe('');
    });

    it('should format DATETIME type with datePipe', () => {
      const col: TableColumn<TestEntity> = {
        field: 'date',
        header: 'Date',
        type: ColumnType.DATETIME,
      };
      const result = component.formatRowValue(
        { date: new Date(2024, 0, 15, 14, 30, 0) },
        col,
      );
      expect(result).toContain('15/01/2024');
    });

    it('should return empty string for null DATETIME value', () => {
      const col: TableColumn<TestEntity> = {
        field: 'date',
        header: 'Date',
        type: ColumnType.DATETIME,
      };
      expect(component.formatRowValue({ date: null }, col)).toBe('');
    });

    it('should format CURRENCY type with currencyPipe', () => {
      const col: TableColumn<TestEntity> = {
        field: 'value',
        header: 'Value',
        type: ColumnType.CURRENCY,
      };
      const result = component.formatRowValue({ value: 100 }, col);
      expect(result).toBeTruthy();
    });

    it('should return empty string for null CURRENCY value', () => {
      const col: TableColumn<TestEntity> = {
        field: 'value',
        header: 'Value',
        type: ColumnType.CURRENCY,
      };
      expect(component.formatRowValue({ value: null }, col)).toBe('');
    });

    it('should format PERCENT type with percentPipe', () => {
      const col: TableColumn<TestEntity> = {
        field: 'value',
        header: 'Value',
        type: ColumnType.PERCENT,
      };
      const result = component.formatRowValue({ value: 0.5 }, col);
      expect(result).toBe('50%');
    });

    it('should return empty string for null PERCENT value', () => {
      const col: TableColumn<TestEntity> = {
        field: 'value',
        header: 'Value',
        type: ColumnType.PERCENT,
      };
      expect(component.formatRowValue({ value: null }, col)).toBe('');
    });
  });

  describe('onContextMenuSelect', () => {
    it('should set currentRecord from event data', () => {
      const record = { id: 1, name: 'test' } as TestEntity;
      component.onContextMenuSelect({ data: record });
      expect(component.currentRecord).toBe(record);
    });

    it('should map tableMenu items with enabled permission', () => {
      component.tableMenu = [{ label: 'Edit', permission: 'edit.action' }];
      facade.can.mockReturnValue(true);

      component.onContextMenuSelect({ data: { id: 1 } as TestEntity });

      expect(component.menuItems.length).toBe(1);
      expect(component.menuItems[0].disabled).toBe(false);
      expect(facade.can).toHaveBeenCalledWith('edit.action');
    });

    it('should map tableMenu items with disabled permission', () => {
      component.tableMenu = [{ label: 'Delete', permission: 'delete.action' }];
      facade.can.mockReturnValue(false);

      component.onContextMenuSelect({ data: { id: 1 } as TestEntity });

      expect(component.menuItems[0].disabled).toBe(true);
    });

    it('should enable item without permission', () => {
      component.tableMenu = [{ label: 'View' }];
      facade.can.mockReturnValue(true);

      component.onContextMenuSelect({ data: { id: 1 } as TestEntity });

      expect(facade.can).toHaveBeenCalledWith(undefined);
      expect(component.menuItems[0].disabled).toBe(false);
    });

    it('should invoke action with currentRecord when command is called', () => {
      const action = vi.fn();
      const record = { id: 1 } as TestEntity;
      component.tableMenu = [{ label: 'Edit', action }];

      component.onContextMenuSelect({ data: record });
      component.menuItems[0].command!({} as any);

      expect(action).toHaveBeenCalledWith(record);
    });

    it('should not throw when item has no action', () => {
      component.tableMenu = [{ label: 'View' }];

      component.onContextMenuSelect({ data: { id: 1 } as TestEntity });

      expect(() => component.menuItems[0].command!({} as any)).not.toThrow();
    });

    it('should handle multiple menu items with mixed permissions', () => {
      const action1 = vi.fn();
      const action2 = vi.fn();
      component.tableMenu = [
        { label: 'Edit', permission: 'edit', action: action1 },
        { label: 'Delete', permission: 'delete', action: action2 },
      ];
      facade.can.mockReturnValueOnce(true).mockReturnValueOnce(false);

      component.onContextMenuSelect({ data: { id: 1 } as TestEntity });

      expect(component.menuItems.length).toBe(2);
      expect(component.menuItems[0].disabled).toBe(false);
      expect(component.menuItems[1].disabled).toBe(true);
    });
  });

  describe('onLazyLoad', () => {
    it('should not call applyLazyLoad when lazyLoadEnabled is false', () => {
      fixture.componentRef.setInput('lazyLoadEnabled', false);
      fixture.detectChanges();

      component.onLazyLoad({ first: 0, rows: 10 });

      expect(facade.applyLazyLoad).not.toHaveBeenCalled();
    });

    it('should call applyLazyLoad with page 1 for first page', () => {
      fixture.detectChanges();

      component.onLazyLoad({ first: 0, rows: 10 });

      expect(facade.applyLazyLoad).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('should calculate correct page from offset', () => {
      fixture.detectChanges();

      component.onLazyLoad({ first: 20, rows: 10 });

      expect(facade.applyLazyLoad).toHaveBeenCalledWith(3, 10, undefined);
    });

    it('should use default rows when event.rows is undefined', () => {
      fixture.detectChanges();

      component.onLazyLoad({ first: 0 });

      expect(facade.applyLazyLoad).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('should use default first value of 0 when event.first is undefined', () => {
      fixture.detectChanges();

      component.onLazyLoad({ rows: 5 });

      expect(facade.applyLazyLoad).toHaveBeenCalledWith(1, 5, undefined);
    });

    it('should handle ascending sort', () => {
      fixture.detectChanges();

      component.onLazyLoad({
        first: 0,
        rows: 10,
        sortField: 'name',
        sortOrder: 1,
      });

      expect(facade.applyLazyLoad).toHaveBeenCalledWith(1, 10, 'name');
    });

    it('should handle descending sort', () => {
      fixture.detectChanges();

      component.onLazyLoad({
        first: 0,
        rows: 10,
        sortField: 'name',
        sortOrder: -1,
      });

      expect(facade.applyLazyLoad).toHaveBeenCalledWith(1, 10, '-name');
    });

    it('should handle sortField as array', () => {
      fixture.detectChanges();

      component.onLazyLoad({
        first: 0,
        rows: 10,
        sortField: ['name', 'value'],
        sortOrder: 1,
      });

      expect(facade.applyLazyLoad).toHaveBeenCalledWith(1, 10, 'name');
    });

    it('should handle sortField as array with descending order', () => {
      fixture.detectChanges();

      component.onLazyLoad({
        first: 0,
        rows: 10,
        sortField: ['name', 'value'],
        sortOrder: -1,
      });

      expect(facade.applyLazyLoad).toHaveBeenCalledWith(1, 10, '-name');
    });
  });
});
