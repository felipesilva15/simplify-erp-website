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
    { field: 'name', header: 'Name', sortable: true, type: ColumnType.Text },
    { field: 'value', header: 'Value', type: ColumnType.Currency },
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
        type: ColumnType.Datetime,
      });
      expect(filters[1]).toEqual({
        name: 'updated_at',
        label: 'Atualizado em',
        type: ColumnType.Datetime,
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
        type: ColumnType.Date,
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
        type: ColumnType.Date,
      };
      expect(component.formatRowValue({ date: null }, col)).toBe('');
    });

    it('should format Datetime type with datePipe', () => {
      const col: TableColumn<TestEntity> = {
        field: 'date',
        header: 'Date',
        type: ColumnType.Datetime,
      };
      const result = component.formatRowValue(
        { date: new Date(2024, 0, 15, 14, 30, 0) },
        col,
      );
      expect(result).toContain('15/01/2024');
    });

    it('should return empty string for null Datetime value', () => {
      const col: TableColumn<TestEntity> = {
        field: 'date',
        header: 'Date',
        type: ColumnType.Datetime,
      };
      expect(component.formatRowValue({ date: null }, col)).toBe('');
    });

    it('should format CURRENCY type with currencyPipe', () => {
      const col: TableColumn<TestEntity> = {
        field: 'value',
        header: 'Value',
        type: ColumnType.Currency,
      };
      const result = component.formatRowValue({ value: 100 }, col);
      expect(result).toBeTruthy();
    });

    it('should return empty string for null CURRENCY value', () => {
      const col: TableColumn<TestEntity> = {
        field: 'value',
        header: 'Value',
        type: ColumnType.Currency,
      };
      expect(component.formatRowValue({ value: null }, col)).toBe('');
    });

    it('should format PERCENT type with percentPipe', () => {
      const col: TableColumn<TestEntity> = {
        field: 'value',
        header: 'Value',
        type: ColumnType.Percent,
      };
      const result = component.formatRowValue({ value: 0.5 }, col);
      expect(result).toBe('50%');
    });

    it('should return empty string for null PERCENT value', () => {
      const col: TableColumn<TestEntity> = {
        field: 'value',
        header: 'Value',
        type: ColumnType.Percent,
      };
      expect(component.formatRowValue({ value: null }, col)).toBe('');
    });

    it('should return Sim for truthy BOOLEAN value', () => {
      const col = { field: 'name', header: 'Name', type: ColumnType.Boolean };
      expect(component.formatRowValue({ name: 'x' } as any, col)).toBe('Sim');
    });

    it('should return Não for falsy BOOLEAN value', () => {
      const col = { field: 'name', header: 'Name', type: ColumnType.Boolean };
      expect(component.formatRowValue({ name: '' } as any, col)).toBe('Não');
    });
  });

  describe('onContextMenuSelect', () => {
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

  describe('Mobile', () => {
    it('should initialize isMobile from matchMedia', () => {
      fixture.detectChanges();
      expect(component.isMobile()).toBe(false);
    });

    it('should render mobile cards instead of the table when isMobile is true', () => {
      facade.data.mockReturnValue([{ id: 1, name: 'Felipe', value: 100 }]);
      fixture.detectChanges();
      component.isMobile.set(true);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const card = el.querySelector('.surface-card');
      expect(card).toBeTruthy();
      expect(el.querySelector('.p-datatable')).toBeFalsy();
      expect(card?.textContent).toContain('Felipe');
    });

    it('should highlight selected cards', () => {
      facade.data.mockReturnValue([{ id: 1, name: 'Felipe', value: 100 }]);
      fixture.detectChanges();
      component.isMobile.set(true);
      component.toggleSelection({ id: 1 } as TestEntity, true);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.border-primary')).toBeTruthy();
    });

    it('should not display the id column in the card body', () => {
      facade.data.mockReturnValue([{ id: 1, name: 'Felipe', value: 100 }]);
      component.cols = [
        { field: 'id', header: 'ID', type: ColumnType.Integer },
        { field: 'name', header: 'Nome', type: ColumnType.Text },
        { field: 'value', header: 'Value', type: ColumnType.Currency },
      ];
      fixture.detectChanges();
      component.isMobile.set(true);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const card = el.querySelector('.surface-card');
      expect(card?.textContent).toContain('#1');
      expect(card?.textContent).not.toContain('ID');
    });

    it('should render the table when isMobile is false', () => {
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.p-datatable')).toBeTruthy();
      expect(el.querySelector('.crud-card')).toBeFalsy();
    });
  });

  describe('mobileCardTitle', () => {
    it('should use the name column when present', () => {
      component.cols = [
        { field: 'id', header: 'ID', type: ColumnType.Integer },
        { field: 'name', header: 'Nome', type: ColumnType.Text },
      ];
      expect(component.mobileCardTitle({ id: 1, name: 'Felipe' } as TestEntity)).toBe('Felipe');
    });

    it('should fall back to the first column when there is no name column', () => {
      component.cols = [
        { field: 'email', header: 'E-mail', type: ColumnType.Text },
        { field: 'username', header: 'Usuário', type: ColumnType.Text },
      ];
      expect(component.mobileCardTitle({ email: 'a@b.com' } as any)).toBe('a@b.com');
    });

    it('should fall back to the record id when value is empty', () => {
      component.cols = [{ field: 'email', header: 'E-mail', type: ColumnType.Text }];
      expect(component.mobileCardTitle({ id: 42 } as any)).toBe('#42');
    });
  });

  describe('mobileBodyColumns', () => {
    it('should exclude the title and id columns from the body', () => {
      component.cols = [
        { field: 'id', header: 'ID', type: ColumnType.Integer },
        { field: 'name', header: 'Nome', type: ColumnType.Text },
        { field: 'value', header: 'Value', type: ColumnType.Currency },
      ];
      expect(component.mobileBodyColumns().map(c => c.field)).toEqual(['value']);
    });

    it('should keep template-only columns when no title column is defined', () => {
      component.cols = [
        { field: 'name', header: 'Nome', template: {} as any },
      ];
      expect(component.mobileBodyColumns()).toEqual(component.cols);
    });
  });

  describe('mobile selection', () => {
    it('should add and remove records from selection by id', () => {
      const a = { id: 1 } as TestEntity;
      const b = { id: 2 } as TestEntity;

      component.toggleSelection(a, true);
      component.toggleSelection(b, true);

      expect(component.selectedRecords).toEqual([a, b]);
      expect(component.isSelected(a)).toBe(true);

      component.toggleSelection(a, false);

      expect(component.selectedRecords).toEqual([b]);
      expect(component.isSelected(a)).toBe(false);
    });
  });

  describe('mobileDisplayData', () => {
    it('should return all data when lazy loading is enabled', () => {
      const data = [{ id: 1 }, { id: 2 }];
      facade.data.mockReturnValue(data);
      fixture.detectChanges();
      expect(component.mobileDisplayData()).toEqual(data);
    });

    it('should slice data for the current page when lazy loading is disabled', () => {
      component.first = 2;
      component.rows = 1;
      facade.data.mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
      fixture.componentRef.setInput('lazyLoadEnabled', false);
      fixture.detectChanges();
      expect(component.mobileDisplayData()).toEqual([{ id: 3 }]);
      expect(component.mobileTotalRecords()).toBe(3);
    });
  });

  describe('onPageChange', () => {
    it('should update first and rows and trigger a lazy load', () => {
      fixture.detectChanges();
      component.onPageChange({ first: 10, rows: 5 });
      expect(component.first).toBe(10);
      expect(component.rows).toBe(5);
      expect(facade.applyLazyLoad).toHaveBeenCalledWith(3, 5, undefined);
    });

    it('should only update state when lazy loading is disabled', () => {
      fixture.componentRef.setInput('lazyLoadEnabled', false);
      fixture.detectChanges();
      component.onPageChange({ first: 5, rows: 5 });
      expect(component.first).toBe(5);
      expect(component.rows).toBe(5);
      expect(facade.applyLazyLoad).not.toHaveBeenCalled();
    });
  });

  describe('onMobileMenuClick', () => {
    it('should build menu items and toggle the mobile menu', () => {
      const action = vi.fn();
      const record = { id: 1, name: 'test' } as TestEntity;
      component.tableMenu = [{ label: 'Edit', action }];
      fixture.detectChanges();

      const toggleSpy = vi.spyOn(component.mobileMenu, 'toggle');
      component.onMobileMenuClick(new Event('click'), record);

      expect(component.menuItems.length).toBe(1);
      component.menuItems[0].command!({} as any);
      expect(action).toHaveBeenCalledWith(record);
      expect(toggleSpy).toHaveBeenCalled();
    });
  });
});
