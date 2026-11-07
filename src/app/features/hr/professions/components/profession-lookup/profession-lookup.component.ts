import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { ProfessionService } from '../../services/profession-service';

@Component({
  selector: 'app-profession-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ProfessionLookupComponent), multi: true }
  ],
  templateUrl: './profession-lookup.component.html',
  styleUrl: './profession-lookup.component.scss',
})
export class ProfessionLookupComponent {
  private professionService: ProfessionService = inject(ProfessionService);

  innerControl = new FormControl();
  facade: LookupFacade = new LookupFacade(this.professionService);

  multiple: InputSignal<boolean> = input<boolean>(false);
  selected = output<LookupItem | LookupItem[]>();

  writeValue(value: any): void {
    this.innerControl.setValue(value, { emitEvent: false }); 
  }

  registerOnChange(fn: any): void {
    this.innerControl.valueChanges.subscribe(fn);
  } 

  registerOnTouched(fn: any): void { }

  setDisabledProfession(isDisabled: boolean): void {
    if (isDisabled) {
      this.innerControl.disable({ emitEvent: false });
    } else {
      this.innerControl.enable({ emitEvent: false });
    }
  }
}
