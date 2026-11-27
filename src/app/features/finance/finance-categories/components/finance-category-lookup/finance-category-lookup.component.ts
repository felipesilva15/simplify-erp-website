import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { RequestFiltersType } from '../../../../../core/types/request-filters-type';
import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { FinanceCategoryService } from '../../services/finance-category-service';

@Component({
  selector: 'app-finance-category-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    // eslint-disable-next-line @angular-eslint/no-forward-ref
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FinanceCategoryLookupComponent), multi: true }
  ],
  templateUrl: './finance-category-lookup.component.html',
  styleUrl: './finance-category-lookup.component.scss',
})
export class FinanceCategoryLookupComponent {
  private service: FinanceCategoryService = inject(FinanceCategoryService);

  innerControl = new FormControl<LookupItem | LookupItem[] | null>(null);
  facade: LookupFacade = new LookupFacade(this.service);

  multiple: InputSignal<boolean> = input<boolean>(false);
  filters: InputSignal<RequestFiltersType> = input<RequestFiltersType>({});
  selected = output<LookupItem | LookupItem[]>();

  private onTouched: () => void = () => undefined;

  writeValue(value: LookupItem | LookupItem[] | null): void {
    this.innerControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: LookupItem | LookupItem[] | null) => void): void {
    this.innerControl.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.innerControl.disable({ emitEvent: false });
    } else {
      this.innerControl.enable({ emitEvent: false });
    }
  }
}
