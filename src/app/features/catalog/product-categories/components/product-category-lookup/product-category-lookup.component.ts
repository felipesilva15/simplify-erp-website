import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { ProductCategoryService } from '../../services/product-category-service';

@Component({
  selector: 'app-product-category-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    // eslint-disable-next-line @angular-eslint/no-forward-ref
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProductCategoryLookupComponent), multi: true }
  ],
  templateUrl: './product-category-lookup.component.html',
  styleUrl: './product-category-lookup.component.scss',
})
export class ProductCategoryLookupComponent {
  private service: ProductCategoryService = inject(ProductCategoryService);

  innerControl = new FormControl<LookupItem | LookupItem[] | null>(null);
  facade: LookupFacade = new LookupFacade(this.service);

  multiple: InputSignal<boolean> = input<boolean>(false);
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
