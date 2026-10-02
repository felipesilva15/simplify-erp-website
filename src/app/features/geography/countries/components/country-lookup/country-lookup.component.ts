import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { CountryService } from '../../services/country-service';

@Component({
  selector: 'app-country-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CountryLookupComponent), multi: true }
  ],
  templateUrl: './country-lookup.component.html',
  styleUrl: './country-lookup.component.scss',
})
export class CountryLookupComponent {
  private countryService: CountryService = inject(CountryService);

  innerControl = new FormControl();
  facade: LookupFacade = new LookupFacade(this.countryService);

  multiple: InputSignal<boolean> = input<boolean>(false);
  selected = output<LookupItem | LookupItem[]>();

  writeValue(value: any): void {
    this.innerControl.setValue(value, { emitEvent: false }); 
  }

  registerOnChange(fn: any): void {
    this.innerControl.valueChanges.subscribe(fn);
  } 

  registerOnTouched(fn: any): void { }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.innerControl.disable({ emitEvent: false });
    } else {
      this.innerControl.enable({ emitEvent: false });
    }
  }
}
