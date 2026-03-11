import { ColumnType } from './../../../core/enums/column-type';
import { FilterOperator, FilterOperatorOptions, FilterOperatorLabels } from './../../../core/enums/filter-operator';
import { Component, inject, input, InputSignal, model, ModelSignal, OnInit, output, signal, WritableSignal } from '@angular/core';
import { RequestFiltersType } from '../../../core/types/request-filters-type';
import { FilterFieldDefinition } from '../../../core/models/filter-field-definition';
import { DrawerModule } from 'primeng/drawer';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from "primeng/select";
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from "primeng/fluid";
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';

interface RequestFilterViewData {
  name: string,
  label: string,
  operator: FilterOperator,
  operatorLabel: string,
  value: any,
  type: ColumnType
}

@Component({
  selector: 'app-filter-definer',
  imports: [
    DrawerModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    Select,
    ReactiveFormsModule,
    FluidModule,
    TagModule,
    DividerModule
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    PercentPipe
  ],
  templateUrl: './filter-definer.component.html',
  styleUrl: './filter-definer.component.scss',
})
export class FilterDefinerComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private percentPipe = inject(PercentPipe);

  filters: WritableSignal<RequestFiltersType | undefined> = signal<RequestFiltersType | undefined>(undefined);
  appliedFilters: WritableSignal<RequestFilterViewData[]> = signal<RequestFilterViewData[]>([]);

  fields: InputSignal<FilterFieldDefinition[]> = input.required<FilterFieldDefinition[]>();
  visible: ModelSignal<boolean> = model<boolean>(false);

  apply = output<RequestFiltersType | undefined>();
  visibleChange = output<boolean>();

  FilterOperatorOptions = FilterOperatorOptions;
  FilterOperatorLabels = FilterOperatorLabels;
  ColumnType = ColumnType;

  form: FormGroup = this.fb.nonNullable.group({
    field: [undefined, [Validators.required]],
    operator: [FilterOperator.Equal, [Validators.required]],
    value: [null, [Validators.required]]
  });

  oldSelectedField: WritableSignal<FilterFieldDefinition | undefined> = signal<FilterFieldDefinition | undefined>(undefined);

  setBlankForm(): void {
    this.form.patchValue({
      field: this.fields()[0],
      operator: FilterOperator.Equal,
      value: null
    });
    this.form.markAsPristine();
  }

  ngOnInit(): void {
    this.setBlankForm();
  }

  get selectedField(): FilterFieldDefinition | undefined {
    return this.form.get('field')?.value;
  }

  get operator(): FilterOperator {
    return this.form.get('operator')?.value as FilterOperator
  }

  get filterValue(): any {
    return this.form.get('value')?.value;
  }

  applyFilter(): void {
    if (this.form.invalid) {
      this.form.markAllAsDirty();
      this.form.markAllAsTouched();

      return;
    }

    this.filters.update((f: RequestFiltersType | undefined) => {
      if (!this.selectedField?.name)
        return f;

      if (!f)
        f = {};

      if (!f[this.selectedField.name])
        f[this.selectedField.name] = {};
      
      let value = this.filterValue;

      if (this.selectedField.type == ColumnType.DATE || this.selectedField.type == ColumnType.DATETIME) {
        value = value.toISOString();
      }

      f[this.selectedField.name][this.operator] = value;
      
      return f;
    });

    this.appliedFilters.update((f: RequestFilterViewData[]) => {
      f = this.removeFromAppliedFilters(f, this.selectedField?.name ?? '', this.operator);
      f.push({
        name: this.selectedField?.name ?? '',
        label: this.selectedField?.label ?? '',
        operator: this.operator,
        operatorLabel: this.FilterOperatorLabels[this.operator],
        value: this.filterValue,
        type: this.selectedField?.type ?? ColumnType.TEXT
      });
      f = this.sortAppliedFilters(f);

      return f;
    });

    this.setBlankForm();
  }

  removeFilter(filter: RequestFilterViewData): void {
    this.appliedFilters.update((f: RequestFilterViewData[]) => {
      f = this.removeFromAppliedFilters(f, filter.name, filter.operator);
      f = this.sortAppliedFilters(f);

      return f;
    });

    this.filters.update(f => {
      if (f && f[filter.name][filter.operator]) {
        delete f[filter.name][filter.operator];
      }

      return f;
    });
  }

  applyFilters(): void {
    if (!this.appliedFilters().length) {
      this.filters.set(undefined);
    }

    this.apply.emit(this.filters());
    this.close();
  }

  removeFromAppliedFilters(appliedFilters: RequestFilterViewData[], name: string, operator: FilterOperator): RequestFilterViewData[] {
    return appliedFilters.filter((filter) => !(filter.name == name && filter.operator == operator));
  } 

  sortAppliedFilters(appliedFilters: RequestFilterViewData[]): RequestFilterViewData[] {
    return appliedFilters.sort((a, b) => a.name.localeCompare(b.name) || a.operatorLabel.localeCompare(b.operatorLabel));
  }

  clearFilters(): void {
    this.filters.set(undefined);
    this.appliedFilters.set([]);
    this.apply.emit(this.filters());
    this.close();
  }

  close(): void {
    this.setBlankForm();
    this.visibleChange.emit(false);
  }

  getOperatorLabel(operator: any): string {
    return this.FilterOperatorLabels[operator as FilterOperator] ?? '';
  }

  getFieldLabel(name: string): string {
    return this.fields().find(field => field.name == name)?.label ?? '';
  }

  onChangeField(): void {
    if (this.oldSelectedField() && this.selectedField?.name == this.oldSelectedField()?.name) {
      return;
    }

    this.form.patchValue({ value: null });
    this.form.markAsPristine();
    this.oldSelectedField.set(this.selectedField);
  }

  formatFilterValue(filter: RequestFilterViewData): any {
    const value = filter.value;
    
    switch (filter.type) {
      case ColumnType.DATE:
        return this.datePipe.transform(value, 'dd/MM/yyyy') ?? '';

      case ColumnType.DATETIME:
        return this.datePipe.transform(value, 'dd/MM/yyyy hh:mm') ?? '';

      case ColumnType.CURRENCY:
        return this.currencyPipe.transform(value, 'BRL') ?? '';

      case ColumnType.PERCENT:
        return this.percentPipe.transform(value) ?? '';

      case ColumnType.BOOLEAN:
        return value ? 'Sim' : 'Não';

      default:
        return value;
    }
  }
}
