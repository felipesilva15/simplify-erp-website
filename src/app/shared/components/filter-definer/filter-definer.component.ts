import { ColumnType } from './../../../core/enums/column-type';
import { FilterOperator, FilterOperatorOptions, FilterOperatorLabels } from './../../../core/enums/filter-operator';
import { Component, inject, input, InputSignal, model, ModelSignal, OnInit, output, signal, WritableSignal } from '@angular/core';
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
    NgxMaskDirective
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
  visible: ModelSignal<boolean> = model<boolean>(false);

  apply = output<RequestFiltersType | undefined>();

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

      if (this.selectedField.type == ColumnType.Date || this.selectedField.type == ColumnType.Datetime) {
        value = value.toISOString();
      }

      if (this.selectedField.type == ColumnType.Enum) {
        value = value.code;
      }

      f[this.selectedField.name][this.operator] = value;
      
      return f;
    });

    this.appliedFilters.update((f: RequestFilterViewData[]) => {
      const filter: RequestFilterViewData = {
        name: this.selectedField?.name ?? '',
        label: this.selectedField?.label ?? '',
        operator: this.operator,
        operatorLabel: this.FilterOperatorLabels[this.operator],
        value: this.filterValue,
        type: this.selectedField?.type ?? ColumnType.Text
      };
      filter.formattedValue = this.formatFilterValue(filter);

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

      case ColumnType.Text:
        return this.selectedField?.mask ? this.ngxMaskPipe.transform(value, this.selectedField.mask) : value;

      default:
        return value;
    }
  }
}
