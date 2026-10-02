import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { StateService } from '../../services/state-service';

@Component({
  selector: 'app-state-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StateLookupComponent), multi: true }
  ],
  templateUrl: './state-lookup.component.html',
  styleUrl: './state-lookup.component.scss',
})
export class StateLookupComponent {
  private stateService: StateService = inject(StateService);

  innerControl = new FormControl();
  facade: LookupFacade = new LookupFacade(this.stateService);

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
