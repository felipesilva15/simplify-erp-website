import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { CityService } from '../../services/city-service';

@Component({
  selector: 'app-city-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CityLookupComponent), multi: true }
  ],
  templateUrl: './city-lookup.component.html',
  styleUrl: './city-lookup.component.scss',
})
export class CityLookupComponent {
  private cityService: CityService = inject(CityService);

  innerControl = new FormControl();
  facade: LookupFacade = new LookupFacade(this.cityService);

  multiple: InputSignal<boolean> = input<boolean>(false);
  selected = output<LookupItem | LookupItem[]>();

  writeValue(value: any): void {
    this.innerControl.setValue(value, { emitEvent: false }); 
  }

  registerOnChange(fn: any): void {
    this.innerControl.valueChanges.subscribe(fn);
  } 

  registerOnTouched(fn: any): void { }

  setDisabledCity(isDisabled: boolean): void {
    if (isDisabled) {
      this.innerControl.disable({ emitEvent: false });
    } else {
      this.innerControl.enable({ emitEvent: false });
    }
  }
}
