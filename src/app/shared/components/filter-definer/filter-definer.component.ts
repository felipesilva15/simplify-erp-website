import { ColumnType } from './../../../core/enums/column-type';
import { FilterOperator, FilterOperatorOptions, FilterOperatorLabels, FilterOperatorOption, getFilterOperatorOptionsByColumnType } from './../../../core/enums/filter-operator';
import { Component, computed, inject, input, InputSignal, model, ModelSignal, OnInit, output, signal, WritableSignal } from '@angular/core';
import { RequestFiltersType } from '../../../core/types/request-filters-type';
import { FilterFieldDefinition } from '../../../core/models/filter-field-definition';
import { DrawerModule } from 'primeng/drawer';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select, SelectModule } from "primeng/select";
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from "primeng/fluid";
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { FilterComponentHostComponent } from './filter-component-host.component';
import { LookupItem } from '../../../core/models/lookup-item';

interface RequestFilterViewData {
  name: string,
  label: string,
  operator: FilterOperator,
  operatorLabel: string,
  value: any,
  formattedValue?: any,
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
    DividerModule,
    ToggleSwitchModule,
    SelectModule,
    NgxMaskDirective,
    FilterComponentHostComponent
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    PercentPipe,
    NgxMaskPipe
  ],
  templateUrl: './filter-definer.component.html',
  styleUrl: './filter-definer.component.scss',
  standalone: true
})
export class FilterDefinerComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  private currencyPipe = inject(CurrencyPipe);
  private percentPipe = inject(PercentPipe);
  private ngxMaskPipe = inject(NgxMaskPipe);

  filters: WritableSignal<RequestFiltersType | undefined> = signal<RequestFiltersType | undefined>(undefined);
  appliedFilters: WritableSignal<RequestFilterViewData[]> = signal<RequestFilterViewData[]>([]);

  fields: InputSignal<FilterFieldDefinition[]> = input.required<FilterFieldDefinition[]>();
  /** Filtros definidos pela aplicação: exibidos como somente leitura. */
  fixedFilters: InputSignal<RequestFiltersType> = input<RequestFiltersType>({});
  visible: ModelSignal<boolean> = model<boolean>(false);

  apply = output<RequestFiltersType | undefined>();

  lockedFields = computed<FilterFieldDefinition[]>(() => {
    const names = this.lockedFieldNames();
    return this.fields().filter(field => names.has(field.name));
  });

  selectableFields = computed<FilterFieldDefinition[]>(() => {
    const names = this.lockedFieldNames();
    return this.fields().filter(field => !names.has(field.name));
  });

  lockedFilters = computed<RequestFilterViewData[]>(() => {
    const filters: RequestFilterViewData[] = [];

    Object.entries(this.fixedFilters()).forEach(([name, conditions]) => {
      Object.entries(conditions ?? {}).forEach(([operator, value]) => {
        const definition = this.fields().find(field => field.name === name);
        const filter = this.buildFilterViewData(name, operator as FilterOperator, value, definition);
        filter.formattedValue = value === null || value === undefined
          ? 'Vazio'
          : this.formatFilterValue(filter, definition);
        filters.push(filter);
      });
    });

    return this.sortAppliedFilters(filters);
  });

  filterOperatorOptions: WritableSignal<FilterOperatorOption[]> = signal<FilterOperatorOption[]>([]);
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
    const firstField = this.selectableFields()[0];

    this.form.patchValue({
      field: firstField,
      operator: FilterOperator.Equal,
      value: null
    });
    this.form.markAsPristine();
    this.filterOperatorOptions.set(
      getFilterOperatorOptionsByColumnType(firstField?.type ?? ColumnType.Text)
    );
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

    if (this.isLocked(this.selectedField?.name)) {
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

      if (this.selectedField.type == ColumnType.Date || this.selectedField.type == ColumnType.Datetime) {
        value = value.toISOString();
      }

      if (this.selectedField.type == ColumnType.Enum) {
        value = value.code;
      }

      if (this.selectedField.type == ColumnType.Lookup) {
        value = (value as LookupItem | null)?.key ?? null;
      }

      f[this.selectedField.name][this.operator] = value;
      
      return f;
    });

    this.appliedFilters.update((f: RequestFilterViewData[]) => {
      const filter = this.buildFilterViewData(
        this.selectedField?.name ?? '',
        this.operator,
        this.filterValue,
        this.selectedField
      );
      filter.formattedValue = this.formatFilterValue(filter, this.selectedField);

      f = this.removeFromAppliedFilters(f, this.selectedField?.name ?? '', this.operator);
      f.push(filter);
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
    this.visible.set(false);
  }

  getOperatorLabel(operator: any): string {
    return this.FilterOperatorLabels[operator as FilterOperator] ?? '';
  }

  getFieldLabel(name: string): string {
    return this.fields().find(field => field.name == name)?.label ?? '';
  }

  private lockedFieldNames(): Set<string> {
    return new Set(
      Object.entries(this.fixedFilters())
        .filter(([, conditions]) => Object.keys(conditions ?? {}).length > 0)
        .map(([name]) => name)
    );
  }

  isLocked(name?: string): boolean {
    return !!name && this.lockedFieldNames().has(name);
  }

  private buildFilterViewData(
    name: string,
    operator: FilterOperator,
    value: unknown,
    definition = this.fields().find(field => field.name === name)
  ): RequestFilterViewData {
    return {
      name,
      label: definition?.label ?? name,
      operator,
      operatorLabel: this.FilterOperatorLabels[operator],
      value,
      type: definition?.type ?? ColumnType.Text
    };
  }

  onChangeField(): void {
    if (this.oldSelectedField() && this.selectedField?.name == this.oldSelectedField()?.name) {
      return;
    }

    this.filterOperatorOptions.set(getFilterOperatorOptionsByColumnType(this.selectedField?.type ?? ColumnType.Text));

    this.form.patchValue({ value: null });
    this.form.markAsPristine();
    this.oldSelectedField.set(this.selectedField);
  }

  formatFilterValue(filter: RequestFilterViewData, field?: FilterFieldDefinition): any {
    const value = filter.value;

    switch (filter.type) {
      case ColumnType.Date:
        return this.datePipe.transform(value, 'dd/MM/yyyy') ?? '';

      case ColumnType.Datetime:
        return this.datePipe.transform(value, 'dd/MM/yyyy HH:mm') ?? '';

      case ColumnType.Currency:
        return this.currencyPipe.transform(value, 'BRL') ?? '';

      case ColumnType.Percent:
        return this.percentPipe.transform(value) ?? '';

      case ColumnType.Boolean:
        return value ? 'Sim' : 'Não';

      case ColumnType.Enum:
        return value.name;

      case ColumnType.Lookup:
        return (value as LookupItem | null)?.label ?? (value as LookupItem | null)?.key ?? '';

      case ColumnType.Text: {
        const definition = field ?? this.selectedField;
        return definition?.mask ? this.ngxMaskPipe.transform(value, definition.mask) : value;
      }

      default:
        return value;
    }
  }
}
