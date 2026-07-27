import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LookupComponent } from './lookup.component';
import { LookupFacade } from './../../facades/lookup.facade';
import { LookupItem } from './../../../core/models/lookup-item';
import { LookupResult } from '../../../core/models/lookup-result';

function createMockFacade(): LookupFacade {
  return {
    search: vi.fn().mockReturnValue(of({ items: [], total: 0, page: 1, perPage: 10 } as LookupResult)),
  } as unknown as LookupFacade;
}

function makeItem(key: string | number, label: string): LookupItem {
  return { key, label };
}

describe('LookupComponent', () => {
  let component: any;
  let fixture: ComponentFixture<LookupComponent>;
  let facade: LookupFacade;

  beforeEach(async () => {
    facade = createMockFacade();

    await TestBed.configureTestingModule({
      imports: [LookupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LookupComponent);
    component = fixture.componentInstance as any;
    fixture.componentRef.setInput('facade', facade);
    fixture.detectChanges();
  });

  // ─── Creation ───────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Default input values ───────────────────────────────────────────────────

  it('should have default placeholder', () => {
    expect(component.placeholder).toBe('Buscar...');
  });

  it('should have default emptyMessage', () => {
    expect(component.emptyMessage).toBe('Nenhum resultado encontrado');
  });

  it('should have default debounce', () => {
    expect(component.debounce).toBe(300);
  });

  it('should have default minChars', () => {
    expect(component.minChars).toBe(1);
  });

  it('should have default pageSize', () => {
    expect(component.pageSize).toBe(10);
  });

  it('should have default invalid as false', () => {
    expect(component.invalid).toBe(false);
  });

  it('should have default multiple as false', () => {
    expect(component.multiple).toBe(false);
  });

  it('should have suggestions signal initialized as empty array', () => {
    expect(component.suggestions()).toEqual([]);
  });

  it('should have loading signal initialized as false', () => {
    expect(component.loading()).toBe(false);
  });

  it('should have total signal initialized as null', () => {
    expect(component.total()).toBeNull();
  });

  // ─── ngOnInit ───────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should propagate internalControl changes to onChange', () => {
      const onChangeFn = vi.fn();
      component.registerOnChange(onChangeFn);
      component.ngOnInit();

      const item = makeItem(1, 'Test');
      component.internalControl.setValue(item);

      expect(onChangeFn).toHaveBeenCalledWith(item);
    });

    it('should propagate null from internalControl to onChange', () => {
      const onChangeFn = vi.fn();
      component.registerOnChange(onChangeFn);
      component.ngOnInit();

      component.internalControl.setValue(null);

      expect(onChangeFn).toHaveBeenCalledWith(null);
    });
  });

  // ─── ngOnDestroy ────────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const spy = vi.spyOn(component['destroy$'], 'next');
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(completeSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── onSearch ───────────────────────────────────────────────────────────────

  describe('onSearch', () => {
    it('should set loading to true during search and call facade.search', () => {
      const searchSubject = new Subject<LookupResult>();
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(searchSubject.asObservable());

      component.onSearch({ query: 'test' } as any);

      expect(component.loading()).toBe(true);
      expect(facade.search).toHaveBeenCalledWith({ q: 'test', pageSize: 10 });

      searchSubject.next({ items: [], total: 0, page: 1, perPage: 10 });
      searchSubject.complete();
    });

    it('should set suggestions and total on successful response', () => {
      const items = [makeItem(1, 'Item 1'), makeItem(2, 'Item 2')];
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
        of({ items, total: 25, page: 1, perPage: 10 } as LookupResult)
      );

      component.onSearch({ query: 'test' } as any);

      expect(component.suggestions()).toEqual(items);
      expect(component.total()).toBe(25);
    });

    it('should set loading to false after search completes', () => {
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
        of({ items: [], total: 0, page: 1, perPage: 10 } as LookupResult)
      );

      component.onSearch({ query: 'test' } as any);

      expect(component.loading()).toBe(false);
    });

    it('should call cdr.markForCheck after search completes', () => {
      const spy = vi.spyOn(component['cdr'], 'markForCheck');
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
        of({ items: [], total: 0, page: 1, perPage: 10 } as LookupResult)
      );

      component.onSearch({ query: 'test' } as any);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should handle error with catchError returning empty result', () => {
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
        throwError(() => new Error('API error'))
      );

      component.onSearch({ query: 'test' } as any);

      expect(component.suggestions()).toEqual([]);
      expect(component.total()).toBe(0);
    });

    it('should set loading to false on error', () => {
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
        throwError(() => new Error('API error'))
      );

      component.onSearch({ query: 'test' } as any);

      expect(component.loading()).toBe(false);
    });

    it('should handle response with total as undefined', () => {
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
        of({ items: [makeItem(1, 'A')], total: undefined, page: 1, perPage: 10 } as any)
      );

      component.onSearch({ query: 'test' } as any);

      expect(component.suggestions()).toEqual([makeItem(1, 'A')]);
      expect(component.total()).toBeNull();
    });

    it('should pass pageSize input to facade.search', () => {
      component.pageSize = 25;
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
        of({ items: [], total: 0, page: 1, perPage: 25 } as LookupResult)
      );

      component.onSearch({ query: 'abc' } as any);

      expect(facade.search).toHaveBeenCalledWith({ q: 'abc', pageSize: 25 });
    });

    it('should call cdr.markForCheck on error', () => {
      const spy = vi.spyOn(component['cdr'], 'markForCheck');
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
        throwError(() => new Error('API error'))
      );

      component.onSearch({ query: 'test' } as any);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from search on destroy', () => {
      const searchSubject = new Subject<LookupResult>();
      (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(searchSubject.asObservable());

      component.onSearch({ query: 'test' } as any);
      component.ngOnDestroy();

      searchSubject.next({ items: [makeItem(1, 'A')], total: 1, page: 1, perPage: 1 });

      expect(component.suggestions()).toEqual([]);
    });
  });

  // ─── selectedValue ──────────────────────────────────────────────────────────

  describe('selectedValue', () => {
    it('should return internalControl value in single mode', () => {
      const item = makeItem(1, 'Test');
      component.internalControl.setValue(item);

      expect(component.selectedValue).toEqual(item);
    });

    it('should return internalControl value in multiple mode', () => {
      component.multiple = true;
      const items = [makeItem(1, 'A'), makeItem(2, 'B')];
      component.internalControl.setValue(items);

      expect(component.selectedValue).toEqual(items);
    });

    it('should return null when internalControl has no value', () => {
      expect(component.selectedValue).toBeNull();
    });
  });

  // ─── onSelect ───────────────────────────────────────────────────────────────

  describe('onSelect', () => {
    it('should emit selected with selectedValue', () => {
      vi.spyOn(component.selected, 'emit');
      const item = makeItem(1, 'Test');
      component.internalControl.setValue(item);

      component.onSelect();

      expect(component.selected.emit).toHaveBeenCalledWith(item);
    });
  });

  // ─── onUnselect ─────────────────────────────────────────────────────────────

  describe('onUnselect', () => {
    it('should emit selected with current selectedValue', () => {
      vi.spyOn(component.selected, 'emit');
      component.multiple = true;
      const items = [makeItem(1, 'A'), makeItem(2, 'B')];
      component.internalControl.setValue(items);

      component.onUnselect(makeItem(1, 'A'));

      expect(component.selected.emit).toHaveBeenCalledWith(items);
    });
  });

  // ─── onClear ────────────────────────────────────────────────────────────────

  describe('onClear', () => {
    it('should set internalControl to null', () => {
      component.internalControl.setValue(makeItem(1, 'Test'));

      component.onClear();

      expect(component.internalControl.value).toBeNull();
    });

    it('should emit null in single mode', () => {
      vi.spyOn(component.selected, 'emit');
      component.internalControl.setValue(makeItem(1, 'Test'));

      component.onClear();

      expect(component.selected.emit).toHaveBeenCalledWith(null);
    });

    it('should emit empty array in multiple mode', () => {
      vi.spyOn(component.selected, 'emit');
      component.multiple = true;
      component.internalControl.setValue([makeItem(1, 'A')]);

      component.onClear();

      expect(component.selected.emit).toHaveBeenCalledWith([]);
    });

    it('should call onChange with null', () => {
      const onChangeFn = vi.fn();
      component.registerOnChange(onChangeFn);

      component.onClear();

      expect(onChangeFn).toHaveBeenCalledWith(null);
    });
  });

  // ─── onFocus ────────────────────────────────────────────────────────────────

  describe('onFocus', () => {
    it('should call handleDropdownClick when isEmpty and minChars is 0', () => {
      component.minChars = 0;
      const mockAutoComplete = { handleDropdownClick: vi.fn() };
      const mockEvent = {} as Event;

      component.onFocus(mockAutoComplete as any, mockEvent);

      expect(mockAutoComplete.handleDropdownClick).toHaveBeenCalledWith(mockEvent);
    });

    it('should not call handleDropdownClick when not empty', () => {
      component.minChars = 0;
      component.internalControl.setValue(makeItem(1, 'Test'));
      const mockAutoComplete = { handleDropdownClick: vi.fn() };
      const mockEvent = {} as Event;

      component.onFocus(mockAutoComplete as any, mockEvent);

      expect(mockAutoComplete.handleDropdownClick).not.toHaveBeenCalled();
    });

    it('should not call handleDropdownClick when minChars > 0', () => {
      component.minChars = 1;
      const mockAutoComplete = { handleDropdownClick: vi.fn() };
      const mockEvent = {} as Event;

      component.onFocus(mockAutoComplete as any, mockEvent);

      expect(mockAutoComplete.handleDropdownClick).not.toHaveBeenCalled();
    });

    it('should call handleDropdownClick when multiple and value is empty array', () => {
      component.multiple = true;
      component.minChars = 0;
      component.internalControl.setValue([]);

      const mockAutoComplete = { handleDropdownClick: vi.fn() };
      const mockEvent = {} as Event;

      component.onFocus(mockAutoComplete as any, mockEvent);

      expect(mockAutoComplete.handleDropdownClick).toHaveBeenCalledWith(mockEvent);
    });

    it('should not call handleDropdownClick when multiple and value exists', () => {
      component.multiple = true;
      component.minChars = 0;
      component.internalControl.setValue([makeItem(1, 'A')]);

      const mockAutoComplete = { handleDropdownClick: vi.fn() };
      const mockEvent = {} as Event;

      component.onFocus(mockAutoComplete as any, mockEvent);

      expect(mockAutoComplete.handleDropdownClick).not.toHaveBeenCalled();
    });
  });

  // ─── isSelected ─────────────────────────────────────────────────────────────

  describe('isSelected', () => {
    it('should return false when value is null', () => {
      expect(component.isSelected(makeItem(1, 'Test'))).toBe(false);
    });

    it('should return false in single mode (value is not array)', () => {
      component.internalControl.setValue(makeItem(1, 'Test'));

      expect(component.isSelected(makeItem(1, 'Test'))).toBe(false);
    });

    it('should return true when item key matches in multiple mode', () => {
      component.multiple = true;
      component.internalControl.setValue([makeItem(1, 'A'), makeItem(2, 'B')]);

      expect(component.isSelected(makeItem(1, 'A'))).toBe(true);
    });

    it('should return false when item key does not match in multiple mode', () => {
      component.multiple = true;
      component.internalControl.setValue([makeItem(1, 'A'), makeItem(2, 'B')]);

      expect(component.isSelected(makeItem(3, 'C'))).toBe(false);
    });

    it('should return false when multiple value is empty array', () => {
      component.multiple = true;
      component.internalControl.setValue([]);

      expect(component.isSelected(makeItem(1, 'A'))).toBe(false);
    });
  });

  // ─── isEmpty ────────────────────────────────────────────────────────────────

  describe('isEmpty', () => {
    it('should return true when value is null', () => {
      expect(component.isEmpty()).toBe(true);
    });

    it('should return true in multiple mode with empty array', () => {
      component.multiple = true;
      component.internalControl.setValue([]);

      expect(component.isEmpty()).toBe(true);
    });

    it('should return false in single mode when value exists', () => {
      component.internalControl.setValue(makeItem(1, 'Test'));

      expect(component.isEmpty()).toBe(false);
    });

    it('should return false in multiple mode when value exists', () => {
      component.multiple = true;
      component.internalControl.setValue([makeItem(1, 'A')]);

      expect(component.isEmpty()).toBe(false);
    });

    it('should return true in multiple mode when value is not an array', () => {
      component.multiple = true;
      component.internalControl.setValue(null);

      expect(component.isEmpty()).toBe(true);
    });
  });

  // ─── writeValue ─────────────────────────────────────────────────────────────

  describe('writeValue', () => {
    it('should set null when value is null', () => {
      component.writeValue(null);

      expect(component.internalControl.value).toBeNull();
    });

    it('should set null when value is undefined', () => {
      component.writeValue(undefined as any);

      expect(component.internalControl.value).toBeNull();
    });

    describe('single mode', () => {
      it('should set LookupItem directly', () => {
        const item = makeItem(1, 'Test');
        component.writeValue(item);

        expect(component.internalControl.value).toEqual(item);
      });

      it('should not set loading when value is LookupItem', () => {
        component.writeValue(makeItem(1, 'Test'));

        expect(component.loading()).toBe(false);
      });

      it('should set loading and call facade.search when hydrating primitive key', () => {
        const hydratedItem = makeItem(42, 'Hydrated');
        const searchSubject = new Subject<LookupResult>();
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(searchSubject.asObservable());

        component.writeValue(42);

        expect(component.loading()).toBe(true);
        expect(facade.search).toHaveBeenCalledWith({
          q: '',
          keys: [42],
          page: 1,
          pageSize: 1,
        });

        searchSubject.next({ items: [hydratedItem], total: 1, page: 1, perPage: 1 });
        searchSubject.complete();
      });

      it('should set hydrated item after search completes', () => {
        const hydratedItem = makeItem(42, 'Hydrated');
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [hydratedItem], total: 1, page: 1, perPage: 1 } as LookupResult)
        );

        component.writeValue(42);

        expect(component.internalControl.value).toEqual(hydratedItem);
      });

      it('should set loading to false after hydration completes', () => {
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [makeItem(42, 'A')], total: 1, page: 1, perPage: 1 } as LookupResult)
        );

        component.writeValue(42);

        expect(component.loading()).toBe(false);
      });

      it('should call cdr.markForCheck after hydration', () => {
        const spy = vi.spyOn(component['cdr'], 'markForCheck');
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [makeItem(42, 'A')], total: 1, page: 1, perPage: 1 } as LookupResult)
        );

        component.writeValue(42);

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should set null when facade returns total 0 for primitive key', () => {
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [], total: 0, page: 1, perPage: 1 } as LookupResult)
        );

        component.writeValue(999);

        expect(component.internalControl.value).toBeNull();
      });

      it('should hydrate string primitive key via facade.search', () => {
        const hydratedItem = makeItem('abc', 'Hydrated');
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [hydratedItem], total: 1, page: 1, perPage: 1 } as LookupResult)
        );

        component.writeValue('abc');

        expect(facade.search).toHaveBeenCalledWith({
          q: '',
          keys: ['abc'],
          page: 1,
          pageSize: 1,
        });
        expect(component.internalControl.value).toEqual(hydratedItem);
      });
    });

    describe('multiple mode', () => {
      beforeEach(() => {
        component.multiple = true;
      });

      it('should set LookupItem array directly', () => {
        const items = [makeItem(1, 'A'), makeItem(2, 'B')];
        component.writeValue(items);

        expect(component.internalControl.value).toEqual(items);
      });

      it('should not set loading when all values are LookupItems', () => {
        component.writeValue([makeItem(1, 'A'), makeItem(2, 'B')]);

        expect(component.loading()).toBe(false);
      });

      it('should wrap single LookupItem in array', () => {
        const item = makeItem(1, 'A');
        component.writeValue(item as any);

        expect(component.internalControl.value).toEqual([item]);
      });

      it('should set loading and call facade.search when hydrating primitive keys', () => {
        const hydratedItems = [makeItem(1, 'A'), makeItem(2, 'B')];
        const searchSubject = new Subject<LookupResult>();
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(searchSubject.asObservable());

        component.writeValue([{ id: 1 } as any, { id: 2 } as any]);

        expect(component.loading()).toBe(true);
        expect(facade.search).toHaveBeenCalledWith({
          q: '',
          keys: [1, 2],
          page: 1,
          pageSize: 2,
        });

        searchSubject.next({ items: hydratedItems, total: 2, page: 1, perPage: 2 });
        searchSubject.complete();
      });

      it('should set hydrated items after search completes', () => {
        const hydratedItems = [makeItem(1, 'A'), makeItem(2, 'B')];
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: hydratedItems, total: 2, page: 1, perPage: 2 } as LookupResult)
        );

        component.writeValue([{ id: 1 } as any, { id: 2 } as any]);

        expect(component.internalControl.value).toEqual(hydratedItems);
      });

      it('should set loading to false after hydration completes', () => {
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [], total: 0, page: 1, perPage: 0 } as LookupResult)
        );

        component.writeValue([{ id: 1 } as any]);

        expect(component.loading()).toBe(false);
      });

      it('should call cdr.markForCheck after hydration', () => {
        const spy = vi.spyOn(component['cdr'], 'markForCheck');
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [], total: 0, page: 1, perPage: 0 } as LookupResult)
        );

        component.writeValue([{ id: 1 } as any]);

        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('should filter out null ids when hydrating', () => {
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [], total: 0, page: 1, perPage: 0 } as LookupResult)
        );

        component.writeValue([{ id: 1 } as any, { id: null } as any, { id: undefined } as any, { id: 3 } as any]);

        expect(facade.search).toHaveBeenCalledWith({
          q: '',
          keys: [1, 3],
          page: 1,
          pageSize: 2,
        });
      });

      it('should return empty keys when all ids are null', () => {
        (facade.search as ReturnType<typeof vi.fn>).mockReturnValue(
          of({ items: [], total: 0, page: 1, perPage: 0 } as LookupResult)
        );

        component.writeValue([{ id: null } as any, { id: undefined } as any]);

        expect(facade.search).toHaveBeenCalledWith({
          q: '',
          keys: [],
          page: 1,
          pageSize: 0,
        });
      });
    });
  });

  // ─── registerOnChange ───────────────────────────────────────────────────────

  describe('registerOnChange', () => {
    it('should register onChange function', () => {
      const fn = vi.fn();
      component.registerOnChange(fn);

      component.internalControl.setValue(makeItem(1, 'Test'));

      expect(fn).toHaveBeenCalled();
    });
  });

  // ─── registerOnTouched ─────────────────────────────────────────────────────

  describe('registerOnTouched', () => {
    it('should register onTouched function', () => {
      const fn = vi.fn();
      component.registerOnTouched(fn);

      component.onTouched();

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  // ─── setDisabledState ──────────────────────────────────────────────────────

  describe('setDisabledState', () => {
    it('should set isDisabled to true and disable internalControl', () => {
      component.setDisabledState(true);

      expect(component.isDisabled).toBe(true);
      expect(component.internalControl.disabled).toBe(true);
    });

    it('should set isDisabled to false and enable internalControl', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);

      expect(component.isDisabled).toBe(false);
      expect(component.internalControl.disabled).toBe(false);
    });

    it('should not emit valueChanges when disabling', () => {
      const onChangeFn = vi.fn();
      component.registerOnChange(onChangeFn);
      component.ngOnInit();

      component.setDisabledState(true);

      expect(onChangeFn).not.toHaveBeenCalled();
    });

    it('should not emit valueChanges when enabling', () => {
      const onChangeFn = vi.fn();
      component.registerOnChange(onChangeFn);
      component.ngOnInit();

      component.setDisabledState(true);
      onChangeFn.mockClear();
      component.setDisabledState(false);

      expect(onChangeFn).not.toHaveBeenCalled();
    });
  });

  // ─── String reference ──────────────────────────────────────────────────────

  describe('String reference', () => {
    it('should expose String constructor for template usage', () => {
      expect(component.String).toBe(String);
    });
  });
});
