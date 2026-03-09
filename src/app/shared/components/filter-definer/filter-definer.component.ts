import { ColumnType } from './../../../core/enums/column-type';
import { FilterOperator, FilterOperatorOptions, FilterOperatorLabels } from './../../../core/enums/filter-operator';
import { Component, computed, inject, input, InputSignal, model, ModelSignal, OnInit, output, Signal, signal, WritableSignal } from '@angular/core';
import { RequestFiltersType } from '../../../core/types/request-filters-type';
import { FilterFieldDefinition } from '../../../core/models/filter-field-definition';
import { DrawerModule } from 'primeng/drawer';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from "primeng/select";
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from "primeng/fluid";
import { KeyValuePipe } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';

interface RequestFilterViewData {
  name: string,
  label: string,
  operator: FilterOperator,
  operatorLabel: string,
  value: any
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
    KeyValuePipe,
    TagModule
],
  templateUrl: './filter-definer.component.html',
  styleUrl: './filter-definer.component.scss',
})
export class FilterDefinerComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)

  filters: WritableSignal<RequestFiltersType | null> = signal<RequestFiltersType | null>(null);
  filtersList: Signal<RequestFilterViewData[]> = computed(() => {
    if (!this.filters()){
      return []
    }

    return Object.entries(this.filters() ?? {}).map(([field, operations]) => {
      return []
    });
  })

  fields: InputSignal<FilterFieldDefinition[]> = input.required<FilterFieldDefinition[]>();
  visible: ModelSignal<boolean> = model<boolean>(false);

  apply = output<RequestFiltersType | null>();
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

  constructor() {
    
  }

  setBlankForm(): void {
    this.form.patchValue({
      field: undefined,
      operator: FilterOperator.Equal,
      value: null
    });
    this.form.markAsPristine();
  }

  ngOnInit(): void {

  }

  get selectedField(): FilterFieldDefinition | undefined {
    return this.form.get('field')?.value;
  }

  applyFilter(): void {
    this.filters.update((f: RequestFiltersType | null) => {
      if (!this.selectedField?.name)
        return f;

      if (!f)
        f = {};

      if (!f[this.selectedField.name])
        f[this.selectedField.name] = {};

      f[this.selectedField.name][this.form.get('operator')?.value as FilterOperator] = this.form.get('value')?.value
      
      return f;
    });

    this.setBlankForm();
  }

  applyFilters(): void {
    this.apply.emit(this.filters());
    this.close();
  }

  clearFilters(): void {
    this.filters.set(null);
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
}
