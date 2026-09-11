import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { PartnerTypeService } from '../../services/partner-type-service';

@Component({
  selector: 'app-partner-type-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PartnerTypeLookupComponent), multi: true }
  ],
  templateUrl: './partner-type-lookup.component.html',
  styleUrl: './partner-type-lookup.component.scss',
})
export class PartnerTypeLookupComponent {
  private partnerTypeService: PartnerTypeService = inject(PartnerTypeService);

  innerControl = new FormControl();
  facade: LookupFacade = new LookupFacade(this.partnerTypeService);

  multiple: InputSignal<boolean> = input<boolean>(false);
  selected = output<LookupItem | LookupItem[]>();

  writeValue(value: any): void {
    this.innerControl.setValue(value, { emitEvent: false }); 
  }

  registerOnChange(fn: any): void {
    this.innerControl.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void { /* empty */ }
}
