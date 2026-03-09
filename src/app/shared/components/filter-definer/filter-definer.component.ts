import { filter } from 'rxjs';
import { ColumnType } from './../../../core/enums/column-type';
import { FilterOperator, FilterOperatorOptions } from './../../../core/enums/filter-operator';
import { Component, computed, effect, inject, input, InputSignal, model, ModelSignal, output, signal, WritableSignal } from '@angular/core';
import { RequestFiltersType } from '../../../core/types/request-filters-type';
import { FilterFieldDefinition } from '../../../core/models/filter-field-definition';
import { DrawerModule } from 'primeng/drawer';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from "primeng/select";
import { InputTextModule } from 'primeng/inputtext';
import { FieldFilterValueType } from '../../../core/types/field-filter-value-type';
import { Fluid, FluidModule } from "primeng/fluid";
import { JsonPipe } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';

type FormType = {
  field: FormControl<string>;
  operator: FormControl<FilterOperator>;
  value: FormControl<any>
}

@Component({
  selector: 'app-filter-definer',
  imports: [
    DrawerModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    Select,
    ReactiveFormsModule,
    FluidModule
],
  templateUrl: './filter-definer.component.html',
  styleUrl: './filter-definer.component.scss',
})
export class FilterDefinerComponent<T> {
  private fb: FormBuilder = inject(FormBuilder)

  filters: WritableSignal<RequestFiltersType<T> | null> = signal<RequestFiltersType<T> | null>(null);

  fields: InputSignal<FilterFieldDefinition[]> = input.required<FilterFieldDefinition[]>();
  visible: ModelSignal<boolean> = model<boolean>(false);

  apply = output<RequestFiltersType<T> | null>();
  visibleChange = output<boolean>();

  selectedField?: WritableSignal<FilterFieldDefinition | undefined> = signal<FilterFieldDefinition | undefined>(undefined)

  FilterOperatorOptions = FilterOperatorOptions;
  ColumnType = ColumnType;

  form: FormGroup<FormType> = this.fb.nonNullable.group({
    field: ['', [Validators.required]],
    operator: [FilterOperator.Equal, [Validators.required]],
    value: ['', [Validators.required]]
  });

  constructor() {
    effect(() => {
      this.selectedField?.set(this.fields().find((field) => field.name == this.form.get('field')?.value))
      console.log(this.fields());
    });
  }

  applyFilters(): void {
    this.apply.emit(this.filters());
    this.close();
  }

  clearFilters(): void {
    this.filters.set(null);
    this.close();
  }

  close(): void {
    this.visibleChange.emit(false);
  }
}
