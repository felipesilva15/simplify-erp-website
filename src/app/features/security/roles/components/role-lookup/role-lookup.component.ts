import { Component, forwardRef, inject, input, InputSignal, output } from '@angular/core';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { RoleService } from '../../services/role-service';
import { LookupComponent } from "../../../../../shared/components/lookup/lookup.component";
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LookupItem } from '../../../../../core/models/lookup-item';

@Component({
  selector: 'app-role-lookup',
  imports: [
    LookupComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RoleLookupComponent), multi: true }
  ],
  templateUrl: './role-lookup.component.html',
  styleUrl: './role-lookup.component.scss',
})
export class RoleLookupComponent {
  private roleService: RoleService = inject(RoleService);

  innerControl = new FormControl();
  facade: LookupFacade = new LookupFacade(this.roleService);

  multiple: InputSignal<boolean> = input<boolean>(false);
  selected = output<LookupItem | LookupItem[]>();

  writeValue(value: any): void {
    this.innerControl.setValue(value, { emitEvent: false }); 
  }

  registerOnChange(fn: any): void {
    this.innerControl.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void { }
}
