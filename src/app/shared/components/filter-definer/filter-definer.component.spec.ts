import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { vi } from 'vitest';
import { FilterDefinerComponent } from './filter-definer.component';
import { ColumnType } from './../../../core/enums/column-type';
import { FilterOperator, FilterOperatorLabels, FilterOperatorOptions } from './../../../core/enums/filter-operator';
import { FilterFieldDefinition } from './../../../core/models/filter-field-definition';

@Component({
  template: '<app-filter-definer [fields]="fields" />',
  imports: [FilterDefinerComponent],
})
class TestHostComponent {
  @ViewChild(FilterDefinerComponent) child!: FilterDefinerComponent;
  fields: FilterFieldDefinition[] = [
    { name: 'name', label: 'Nome', type: ColumnType.TEXT },
    { name: 'age', label: 'Idade', type: ColumnType.INTEGER },
    { name: 'birthDate', label: 'Data de Nascimento', type: ColumnType.DATE },
    { name: 'createdAt', label: 'Data de Criação', type: ColumnType.DATETIME },
    { name: 'salary', label: 'Salário', type: ColumnType.CURRENCY },
    { name: 'active', label: 'Ativo', type: ColumnType.BOOLEAN },
    { name: 'discount', label: 'Desconto', type: ColumnType.PERCENT },
    { name: 'value', label: 'Valor', type: ColumnType.DECIMAL },
  ];
}

describe('FilterDefinerComponent', () => {
  let component: FilterDefinerComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let datePipeSpy: DatePipe;
  let currencyPipeSpy: CurrencyPipe;
  let percentPipeSpy: PercentPipe;

  const mockFields: FilterFieldDefinition[] = [
    { name: 'name', label: 'Nome', type: ColumnType.TEXT },
    { name: 'age', label: 'Idade', type: ColumnType.INTEGER },
    { name: 'birthDate', label: 'Data de Nascimento', type: ColumnType.DATE },
    { name: 'createdAt', label: 'Data de Criação', type: ColumnType.DATETIME },
    { name: 'salary', label: 'Salário', type: ColumnType.CURRENCY },
    { name: 'active', label: 'Ativo', type: ColumnType.BOOLEAN },
    { name: 'discount', label: 'Desconto', type: ColumnType.PERCENT },
    { name: 'value', label: 'Valor', type: ColumnType.DECIMAL },
  ];

  const makeFilterViewData = (
    name: string,
    label: string,
    operator: FilterOperator,
    value: any,
    type: ColumnType
  ) => ({
    name,
    label,
    operator,
    operatorLabel: FilterOperatorLabels[operator],
    value,
    type,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [DatePipe, CurrencyPipe, PercentPipe],
    })
      .overrideComponent(FilterDefinerComponent, {
        remove: { providers: [DatePipe, CurrencyPipe, PercentPipe] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = host.child;

    datePipeSpy = TestBed.inject(DatePipe);
    currencyPipeSpy = TestBed.inject(CurrencyPipe);
    percentPipeSpy = TestBed.inject(PercentPipe);
  });

  // ─── Initialization & Properties ────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize FilterOperatorOptions', () => {
    expect(component.FilterOperatorOptions).toEqual(FilterOperatorOptions);
  });

  it('should initialize FilterOperatorLabels', () => {
    expect(component.FilterOperatorLabels).toEqual(FilterOperatorLabels);
  });

  it('should initialize ColumnType enum', () => {
    expect(component.ColumnType).toEqual(ColumnType);
  });

  it('should have form with field, operator, and value controls', () => {
    expect(component.form.get('field')).toBeTruthy();
    expect(component.form.get('operator')).toBeTruthy();
    expect(component.form.get('value')).toBeTruthy();
  });

  it('should have form operator default to Equal', () => {
    expect(component.form.get('operator')?.value).toBe(FilterOperator.Equal);
  });

  it('should have filters signal initialized as undefined', () => {
    expect(component.filters()).toBeUndefined();
  });

  it('should have appliedFilters signal initialized as empty array', () => {
    expect(component.appliedFilters()).toEqual([]);
  });

  it('should have visible signal initialized as false', () => {
    expect(component.visible()).toBe(false);
  });

  it('should have oldSelectedField signal initialized as undefined', () => {
    expect(component.oldSelectedField()).toBeUndefined();
  });

  // ─── ngOnInit ───────────────────────────────────────────────────────────────

  it('should call setBlankForm on ngOnInit', () => {
    vi.spyOn(component, 'setBlankForm');
    component.ngOnInit();
    expect(component.setBlankForm).toHaveBeenCalledTimes(1);
  });

  // ─── setBlankForm ───────────────────────────────────────────────────────────

  it('should setBlankForm with first field, Equal operator, and null value', () => {
    component.setBlankForm();
    expect(component.form.get('field')?.value).toEqual(mockFields[0]);
    expect(component.form.get('operator')?.value).toBe(FilterOperator.Equal);
    expect(component.form.get('value')?.value).toBeNull();
  });

  it('should mark form as pristine after setBlankForm', () => {
    vi.spyOn(component.form, 'markAsPristine');
    component.setBlankForm();
    expect(component.form.markAsPristine).toHaveBeenCalledTimes(1);
  });

  // ─── Getters ────────────────────────────────────────────────────────────────

  it('selectedField getter should return current field value', () => {
    expect(component.selectedField).toEqual(mockFields[0]);
  });

  it('selectedField getter should return undefined when field is unset', () => {
    component.form.get('field')?.setValue(undefined);
    expect(component.selectedField).toBeUndefined();
  });

  it('operator getter should return current operator value', () => {
    expect(component.operator).toBe(FilterOperator.Equal);
  });

  it('operator getter should return updated operator', () => {
    component.form.get('operator')?.setValue(FilterOperator.GreaterThan);
    expect(component.operator).toBe(FilterOperator.GreaterThan);
  });

  it('filterValue getter should return current value', () => {
    expect(component.filterValue).toBeNull();
  });

  it('filterValue getter should return updated value', () => {
    component.form.get('value')?.setValue('test');
    expect(component.filterValue).toBe('test');
  });

  // ─── applyFilter ────────────────────────────────────────────────────────────

  describe('applyFilter', () => {
    it('should mark form as dirty and touched when form is invalid', () => {
      component.form.get('value')?.setValue(null);

      vi.spyOn(component.form, 'markAllAsDirty');
      vi.spyOn(component.form, 'markAllAsTouched');

      component.applyFilter();

      expect(component.form.markAllAsDirty).toHaveBeenCalledTimes(1);
      expect(component.form.markAllAsTouched).toHaveBeenCalledTimes(1);
    });

    it('should not update filters when form is invalid', () => {
      component.form.get('value')?.setValue(null);
      component.applyFilter();
      expect(component.filters()).toBeUndefined();
    });

    it('should not update appliedFilters when form is invalid', () => {
      component.form.get('value')?.setValue(null);
      component.applyFilter();
      expect(component.appliedFilters()).toEqual([]);
    });

    it('should add filter to filters signal on valid form', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });

      component.applyFilter();

      expect(component.filters()).toEqual({
        name: { [FilterOperator.Equal]: 'test' },
      });
    });

    it('should add filter to appliedFilters signal on valid form', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });

      component.applyFilter();

      expect(component.appliedFilters()).toEqual([
        makeFilterViewData('name', 'Nome', FilterOperator.Equal, 'test', ColumnType.TEXT),
      ]);
    });

    it('should call setBlankForm after applying filter', () => {
      vi.spyOn(component, 'setBlankForm');
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });

      component.applyFilter();

      expect(component.setBlankForm).toHaveBeenCalledTimes(1);
    });

    it('should append filter to existing filters', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'John',
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[1],
        operator: FilterOperator.GreaterThan,
        value: 18,
      });
      component.applyFilter();

      expect(component.filters()).toEqual({
        name: { [FilterOperator.Equal]: 'John' },
        age: { [FilterOperator.GreaterThan]: 18 },
      });
    });

    it('should overwrite same field with same operator', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'John',
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'Jane',
      });
      component.applyFilter();

      expect(component.filters()).toEqual({
        name: { [FilterOperator.Equal]: 'Jane' },
      });
    });

    it('should support multiple operators on same field', () => {
      component.form.patchValue({
        field: mockFields[1],
        operator: FilterOperator.GreaterThan,
        value: 18,
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[1],
        operator: FilterOperator.LessThan,
        value: 65,
      });
      component.applyFilter();

      expect(component.filters()).toEqual({
        age: {
          [FilterOperator.GreaterThan]: 18,
          [FilterOperator.LessThan]: 65,
        },
      });
    });

    it('should convert DATE value to ISO string', () => {
      const date = new Date(2025, 0, 15);
      component.form.patchValue({
        field: mockFields[2],
        operator: FilterOperator.Equal,
        value: date,
      });

      component.applyFilter();

      expect(component.filters()).toEqual({
        birthDate: { [FilterOperator.Equal]: date.toISOString() },
      });
    });

    it('should convert DATETIME value to ISO string', () => {
      const date = new Date(2025, 5, 20, 14, 30);
      component.form.patchValue({
        field: mockFields[3],
        operator: FilterOperator.Equal,
        value: date,
      });

      component.applyFilter();

      expect(component.filters()).toEqual({
        createdAt: { [FilterOperator.Equal]: date.toISOString() },
      });
    });

    it('should not convert non-DATE/DATETIME values', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Like,
        value: 'test',
      });

      component.applyFilter();

      expect(component.filters()).toEqual({
        name: { [FilterOperator.Like]: 'test' },
      });
    });

    it('should return early when selectedField has no name', () => {
      component.form.patchValue({
        field: { name: '', label: '', type: ColumnType.TEXT },
        operator: FilterOperator.Equal,
        value: 'test',
      });

      component.applyFilter();

      expect(component.filters()).toBeUndefined();
    });

    it('should replace duplicate filter in appliedFilters', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'John',
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'Jane',
      });
      component.applyFilter();

      expect(component.appliedFilters().length).toBe(1);
      expect(component.appliedFilters()[0].value).toBe('Jane');
    });

    it('should sort appliedFilters after adding', () => {
      component.form.patchValue({
        field: mockFields[1],
        operator: FilterOperator.Equal,
        value: 25,
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });
      component.applyFilter();

      expect(component.appliedFilters()[0].name).toBe('age');
      expect(component.appliedFilters()[1].name).toBe('name');
    });

    it('should set operatorLabel in appliedFilters', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.NotEqual,
        value: 'test',
      });

      component.applyFilter();

      expect(component.appliedFilters()[0].operatorLabel).toBe('Diferente');
    });
  });

  // ─── removeFilter ───────────────────────────────────────────────────────────

  describe('removeFilter', () => {
    it('should remove filter from appliedFilters', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });
      component.applyFilter();

      const filter = component.appliedFilters()[0];
      component.removeFilter(filter);

      expect(component.appliedFilters()).toEqual([]);
    });

    it('should remove filter from filters signal', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });
      component.applyFilter();

      const filter = component.appliedFilters()[0];
      component.removeFilter(filter);

      expect(component.filters()).toEqual({
        name: {},
      });
    });

    it('should only remove matching filter, keeping others', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'John',
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[1],
        operator: FilterOperator.GreaterThan,
        value: 18,
      });
      component.applyFilter();

      const filter = component.appliedFilters().find(f => f.name === 'name')!;
      component.removeFilter(filter);

      expect(component.appliedFilters().length).toBe(1);
      expect(component.appliedFilters()[0].name).toBe('age');
      expect(component.filters()).toEqual({
        name: {},
        age: { [FilterOperator.GreaterThan]: 18 },
      });
    });

    it('should sort appliedFilters after removal', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'a',
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[1],
        operator: FilterOperator.Equal,
        value: 1,
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[2],
        operator: FilterOperator.Equal,
        value: new Date(2025, 0, 15),
      });
      component.applyFilter();

      const filter = component.appliedFilters().find(f => f.name === 'name')!;
      component.removeFilter(filter);

      expect(component.appliedFilters().length).toBe(2);
      expect(component.appliedFilters()[0].name).toBe('age');
      expect(component.appliedFilters()[1].name).toBe('birthDate');
    });
  });

  // ─── applyFilters ───────────────────────────────────────────────────────────

  describe('applyFilters', () => {
    it('should emit filters via apply output', () => {
      vi.spyOn(component.apply, 'emit');

      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });
      component.applyFilter();

      component.applyFilters();

      expect(component.apply.emit).toHaveBeenCalledWith({
        name: { [FilterOperator.Equal]: 'test' },
      });
    });

    it('should set filters to undefined when appliedFilters is empty', () => {
      vi.spyOn(component.apply, 'emit');

      component.applyFilters();

      expect(component.filters()).toBeUndefined();
      expect(component.apply.emit).toHaveBeenCalledWith(undefined);
    });

    it('should call close', () => {
      vi.spyOn(component, 'close');
      component.applyFilters();
      expect(component.close).toHaveBeenCalledTimes(1);
    });
  });

  // ─── clearFilters ───────────────────────────────────────────────────────────

  describe('clearFilters', () => {
    it('should set filters to undefined', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });
      component.applyFilter();

      component.clearFilters();

      expect(component.filters()).toBeUndefined();
    });

    it('should set appliedFilters to empty array', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });
      component.applyFilter();

      component.clearFilters();

      expect(component.appliedFilters()).toEqual([]);
    });

    it('should emit undefined via apply output', () => {
      vi.spyOn(component.apply, 'emit');

      component.clearFilters();

      expect(component.apply.emit).toHaveBeenCalledWith(undefined);
    });

    it('should call close', () => {
      vi.spyOn(component, 'close');

      component.clearFilters();

      expect(component.close).toHaveBeenCalledTimes(1);
    });
  });

  // ─── close ──────────────────────────────────────────────────────────────────

  describe('close', () => {
    it('should call setBlankForm', () => {
      vi.spyOn(component, 'setBlankForm');

      component.close();

      expect(component.setBlankForm).toHaveBeenCalledTimes(1);
    });

    it('should set visible to false', () => {
      component.visible.set(true);

      component.close();

      expect(component.visible()).toBe(false);
    });

    it('should set visible to false when already false', () => {
      component.visible.set(false);

      component.close();

      expect(component.visible()).toBe(false);
    });
  });

  // ─── removeFromAppliedFilters ───────────────────────────────────────────────

  describe('removeFromAppliedFilters', () => {
    it('should remove matching filter by name and operator', () => {
      const filters = [
        makeFilterViewData('name', 'Nome', FilterOperator.Equal, 'test', ColumnType.TEXT),
        makeFilterViewData('age', 'Idade', FilterOperator.Equal, 25, ColumnType.INTEGER),
      ];

      const result = component.removeFromAppliedFilters(filters, 'name', FilterOperator.Equal);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('age');
    });

    it('should not remove filter when operator does not match', () => {
      const filters = [
        makeFilterViewData('name', 'Nome', FilterOperator.Equal, 'test', ColumnType.TEXT),
      ];

      const result = component.removeFromAppliedFilters(filters, 'name', FilterOperator.NotEqual);

      expect(result.length).toBe(1);
    });

    it('should not remove filter when name does not match', () => {
      const filters = [
        makeFilterViewData('name', 'Nome', FilterOperator.Equal, 'test', ColumnType.TEXT),
      ];

      const result = component.removeFromAppliedFilters(filters, 'age', FilterOperator.Equal);

      expect(result.length).toBe(1);
    });

    it('should return empty array when all filters are removed', () => {
      const filters = [
        makeFilterViewData('name', 'Nome', FilterOperator.Equal, 'test', ColumnType.TEXT),
      ];

      const result = component.removeFromAppliedFilters(filters, 'name', FilterOperator.Equal);

      expect(result.length).toBe(0);
    });

    it('should return original array when no filters match', () => {
      const filters = [
        makeFilterViewData('age', 'Idade', FilterOperator.Equal, 25, ColumnType.INTEGER),
        makeFilterViewData('salary', 'Salário', FilterOperator.GreaterThan, 5000, ColumnType.CURRENCY),
      ];

      const result = component.removeFromAppliedFilters(filters, 'name', FilterOperator.Equal);

      expect(result.length).toBe(2);
    });
  });

  // ─── sortAppliedFilters ─────────────────────────────────────────────────────

  describe('sortAppliedFilters', () => {
    it('should sort filters by name', () => {
      const filters = [
        makeFilterViewData('salary', 'Salário', FilterOperator.Equal, 5000, ColumnType.CURRENCY),
        makeFilterViewData('age', 'Idade', FilterOperator.Equal, 25, ColumnType.INTEGER),
        makeFilterViewData('name', 'Nome', FilterOperator.Equal, 'test', ColumnType.TEXT),
      ];

      const result = component.sortAppliedFilters(filters);

      expect(result[0].name).toBe('age');
      expect(result[1].name).toBe('name');
      expect(result[2].name).toBe('salary');
    });

    it('should sort filters by operatorLabel when names are equal', () => {
      const filters = [
        makeFilterViewData('name', 'Nome', FilterOperator.GreaterThan, 'b', ColumnType.TEXT),
        makeFilterViewData('name', 'Nome', FilterOperator.Equal, 'a', ColumnType.TEXT),
        makeFilterViewData('name', 'Nome', FilterOperator.Like, 'c', ColumnType.TEXT),
      ];

      const result = component.sortAppliedFilters(filters);

      expect(result[0].operatorLabel).toBe('Contém');
      expect(result[1].operatorLabel).toBe('Igual');
      expect(result[2].operatorLabel).toBe('Maior');
    });

    it('should return empty array for empty input', () => {
      const result = component.sortAppliedFilters([]);
      expect(result).toEqual([]);
    });

    it('should return same array reference', () => {
      const filters = [
        makeFilterViewData('salary', 'Salário', FilterOperator.Equal, 5000, ColumnType.CURRENCY),
        makeFilterViewData('age', 'Idade', FilterOperator.Equal, 25, ColumnType.INTEGER),
      ];

      const result = component.sortAppliedFilters(filters);

      expect(result).toBe(filters);
    });
  });

  // ─── getOperatorLabel ───────────────────────────────────────────────────────

  describe('getOperatorLabel', () => {
    it('should return label for valid operator', () => {
      expect(component.getOperatorLabel(FilterOperator.Equal)).toBe('Igual');
      expect(component.getOperatorLabel(FilterOperator.Like)).toBe('Contém');
      expect(component.getOperatorLabel(FilterOperator.GreaterThan)).toBe('Maior');
      expect(component.getOperatorLabel(FilterOperator.GreaterThanEqual)).toBe('Maior igual');
      expect(component.getOperatorLabel(FilterOperator.LessThan)).toBe('Menor');
      expect(component.getOperatorLabel(FilterOperator.LessThanEqual)).toBe('Menor igual');
      expect(component.getOperatorLabel(FilterOperator.NotEqual)).toBe('Diferente');
    });

    it('should return empty string for invalid operator', () => {
      expect(component.getOperatorLabel('invalid')).toBe('');
    });
  });

  // ─── getFieldLabel ──────────────────────────────────────────────────────────

  describe('getFieldLabel', () => {
    it('should return label for existing field name', () => {
      expect(component.getFieldLabel('name')).toBe('Nome');
      expect(component.getFieldLabel('age')).toBe('Idade');
      expect(component.getFieldLabel('birthDate')).toBe('Data de Nascimento');
    });

    it('should return empty string for non-existing field name', () => {
      expect(component.getFieldLabel('nonexistent')).toBe('');
    });
  });

  // ─── onChangeField ──────────────────────────────────────────────────────────

  describe('onChangeField', () => {
    it('should reset value to null when field changes', () => {
      component.form.get('value')?.setValue('test');
      component.form.get('field')?.setValue(mockFields[1]);
      component.oldSelectedField.set(mockFields[0]);

      component.onChangeField();

      expect(component.form.get('value')?.value).toBeNull();
    });

    it('should mark form as pristine when field changes', () => {
      vi.spyOn(component.form, 'markAsPristine');
      component.form.get('field')?.setValue(mockFields[1]);
      component.oldSelectedField.set(mockFields[0]);

      component.onChangeField();

      expect(component.form.markAsPristine).toHaveBeenCalledTimes(1);
    });

    it('should update oldSelectedField when field changes', () => {
      component.form.get('field')?.setValue(mockFields[1]);
      component.oldSelectedField.set(mockFields[0]);

      component.onChangeField();

      expect(component.oldSelectedField()).toEqual(mockFields[1]);
    });

    it('should not reset value when same field is selected', () => {
      component.form.get('value')?.setValue('test');
      component.form.get('field')?.setValue(mockFields[0]);
      component.oldSelectedField.set(mockFields[0]);

      vi.spyOn(component.form, 'markAsPristine');

      component.onChangeField();

      expect(component.form.get('value')?.value).toBe('test');
      expect(component.form.markAsPristine).not.toHaveBeenCalled();
    });

    it('should reset value when oldSelectedField is undefined', () => {
      component.form.get('field')?.setValue(mockFields[0]);

      component.onChangeField();

      expect(component.form.get('value')?.value).toBeNull();
    });

    it('should update oldSelectedField when oldSelectedField is undefined', () => {
      component.form.get('field')?.setValue(mockFields[0]);

      component.onChangeField();

      expect(component.oldSelectedField()).toEqual(mockFields[0]);
    });
  });

  // ─── formatFilterValue ──────────────────────────────────────────────────────

  describe('formatFilterValue', () => {
    it('should format DATE type using DatePipe with dd/MM/yyyy', () => {
      const date = new Date(2025, 0, 15);
      vi.spyOn(datePipeSpy, 'transform').mockReturnValue('15/01/2025');

      const result = component.formatFilterValue(
        makeFilterViewData('birthDate', 'Data de Nascimento', FilterOperator.Equal, date, ColumnType.DATE)
      );

      expect(datePipeSpy.transform).toHaveBeenCalledWith(date, 'dd/MM/yyyy');
      expect(result).toBe('15/01/2025');
    });

    it('should return empty string when DatePipe returns null for DATE', () => {
      vi.spyOn(datePipeSpy, 'transform').mockReturnValue(null);

      const result = component.formatFilterValue(
        makeFilterViewData('birthDate', 'Data de Nascimento', FilterOperator.Equal, null, ColumnType.DATE)
      );

      expect(result).toBe('');
    });

    it('should format DATETIME type using DatePipe with dd/MM/yyyy HH:mm', () => {
      const date = new Date(2025, 5, 20, 14, 30);
      vi.spyOn(datePipeSpy, 'transform').mockReturnValue('20/06/2025 14:30');

      const result = component.formatFilterValue(
        makeFilterViewData('createdAt', 'Data de Criação', FilterOperator.Equal, date, ColumnType.DATETIME)
      );

      expect(datePipeSpy.transform).toHaveBeenCalledWith(date, 'dd/MM/yyyy HH:mm');
      expect(result).toBe('20/06/2025 14:30');
    });

    it('should return empty string when DatePipe returns null for DATETIME', () => {
      vi.spyOn(datePipeSpy, 'transform').mockReturnValue(null);

      const result = component.formatFilterValue(
        makeFilterViewData('createdAt', 'Data de Criação', FilterOperator.Equal, null, ColumnType.DATETIME)
      );

      expect(result).toBe('');
    });

    it('should format CURRENCY type using CurrencyPipe with BRL', () => {
      vi.spyOn(currencyPipeSpy, 'transform').mockReturnValue('R$ 5.000,00');

      const result = component.formatFilterValue(
        makeFilterViewData('salary', 'Salário', FilterOperator.Equal, 5000, ColumnType.CURRENCY)
      );

      expect(currencyPipeSpy.transform).toHaveBeenCalledWith(5000, 'BRL');
      expect(result).toBe('R$ 5.000,00');
    });

    it('should return empty string when CurrencyPipe returns null for CURRENCY', () => {
      vi.spyOn(currencyPipeSpy, 'transform').mockReturnValue(null);

      const result = component.formatFilterValue(
        makeFilterViewData('salary', 'Salário', FilterOperator.Equal, null, ColumnType.CURRENCY)
      );

      expect(result).toBe('');
    });

    it('should format PERCENT type using PercentPipe', () => {
      vi.spyOn(percentPipeSpy, 'transform').mockReturnValue('25%');

      const result = component.formatFilterValue(
        makeFilterViewData('discount', 'Desconto', FilterOperator.Equal, 0.25, ColumnType.PERCENT)
      );

      expect(percentPipeSpy.transform).toHaveBeenCalledWith(0.25);
      expect(result).toBe('25%');
    });

    it('should return empty string when PercentPipe returns null for PERCENT', () => {
      vi.spyOn(percentPipeSpy, 'transform').mockReturnValue(null);

      const result = component.formatFilterValue(
        makeFilterViewData('discount', 'Desconto', FilterOperator.Equal, null, ColumnType.PERCENT)
      );

      expect(result).toBe('');
    });

    it('should return "Sim" for BOOLEAN true', () => {
      const result = component.formatFilterValue(
        makeFilterViewData('active', 'Ativo', FilterOperator.Equal, true, ColumnType.BOOLEAN)
      );
      expect(result).toBe('Sim');
    });

    it('should return "Não" for BOOLEAN false', () => {
      const result = component.formatFilterValue(
        makeFilterViewData('active', 'Ativo', FilterOperator.Equal, false, ColumnType.BOOLEAN)
      );
      expect(result).toBe('Não');
    });

    it('should return raw value for TEXT type (default case)', () => {
      const result = component.formatFilterValue(
        makeFilterViewData('name', 'Nome', FilterOperator.Equal, 'John', ColumnType.TEXT)
      );
      expect(result).toBe('John');
    });

    it('should return raw value for INTEGER type (default case)', () => {
      const result = component.formatFilterValue(
        makeFilterViewData('age', 'Idade', FilterOperator.Equal, 25, ColumnType.INTEGER)
      );
      expect(result).toBe(25);
    });

    it('should return raw value for DECIMAL type (default case)', () => {
      const result = component.formatFilterValue(
        makeFilterViewData('value', 'Valor', FilterOperator.Equal, 19.99, ColumnType.DECIMAL)
      );
      expect(result).toBe(19.99);
    });
  });

  // ─── Integration-like scenarios ─────────────────────────────────────────────

  describe('full filter lifecycle', () => {
    it('should apply multiple filters, remove one, and apply remaining', () => {
      vi.spyOn(component.apply, 'emit');

      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'John',
      });
      component.applyFilter();

      component.form.patchValue({
        field: mockFields[1],
        operator: FilterOperator.GreaterThan,
        value: 18,
      });
      component.applyFilter();

      expect(component.appliedFilters().length).toBe(2);

      const nameFilter = component.appliedFilters().find(f => f.name === 'name')!;
      component.removeFilter(nameFilter);

      expect(component.appliedFilters().length).toBe(1);

      component.applyFilters();

      expect(component.apply.emit).toHaveBeenCalledWith({
        name: {},
        age: { [FilterOperator.GreaterThan]: 18 },
      });
    });

    it('should clear all filters and emit undefined', () => {
      vi.spyOn(component.apply, 'emit');

      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });
      component.applyFilter();

      component.clearFilters();

      expect(component.filters()).toBeUndefined();
      expect(component.appliedFilters()).toEqual([]);
      expect(component.apply.emit).toHaveBeenCalledWith(undefined);
    });

    it('should apply, close, and verify form is reset', () => {
      component.form.patchValue({
        field: mockFields[0],
        operator: FilterOperator.Equal,
        value: 'test',
      });
      component.applyFilter();

      component.applyFilters();

      expect(component.visible()).toBe(false);
      expect(component.form.get('field')?.value).toEqual(mockFields[0]);
      expect(component.form.get('operator')?.value).toBe(FilterOperator.Equal);
      expect(component.form.get('value')?.value).toBeNull();
    });

    it('should not emit filters when applyFilters is called with no applied filters', () => {
      vi.spyOn(component.apply, 'emit');

      component.applyFilters();

      expect(component.filters()).toBeUndefined();
      expect(component.apply.emit).toHaveBeenCalledWith(undefined);
    });
  });
});
