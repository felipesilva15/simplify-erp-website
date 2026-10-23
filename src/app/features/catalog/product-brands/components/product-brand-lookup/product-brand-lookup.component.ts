import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { ProductBrandService } from '../../services/product-brand-service';

@Component({
  selector: 'app-product-brand-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    // eslint-disable-next-line @angular-eslint/no-forward-ref
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProductBrandLookupComponent), multi: true }
  ],
  templateUrl: './product-brand-lookup.component.html',
  styleUrl: './product-brand-lookup.component.scss',
})
export class ProductBrandLookupComponent {
  private service: ProductBrandService = inject(ProductBrandService);

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
