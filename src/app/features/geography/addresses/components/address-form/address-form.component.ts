import { ChangeDetectionStrategy, Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ChildEntityForm } from '../../../../../core/contracts/child-entity-form';
import { ChildRowErrors } from '../../../../../core/models/child-row-errors';
import { CHILD_FORM_ERRORS, CHILD_FORM_ITEM, CHILD_ITEM_EDITOR } from '../../../../../core/models/child-form-tokens';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { CountryLookupComponent } from '../../../countries/components/country-lookup/country-lookup.component';
import { StateLookupComponent } from '../../../states/components/state-lookup/state-lookup.component';
import { CityLookupComponent } from '../../../cities/components/city-lookup/city-lookup.component';
import { AddressType, AddressTypeOptions } from '../../enums/address-type';
import { Address } from '../../models/address';

const POSTAL_CODE_PATTERN = /^\d{5}-?\d{3}$/;
const BRAZIL_ISO_CODE = 'BR';

@Component({
  selector: 'app-address-form',
  imports: [
    ReactiveFormsModule,
    FluidModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    ToggleSwitchModule,
    FormControlErrorsComponent,
    CountryLookupComponent,
    StateLookupComponent,
    CityLookupComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent implements ChildEntityForm<Address> {
  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly item: Signal<Address | null> = inject(CHILD_FORM_ITEM) as Signal<Address | null>;
  readonly errors: Signal<ChildRowErrors> = inject(CHILD_FORM_ERRORS) as Signal<ChildRowErrors>;
  readonly editor = inject(CHILD_ITEM_EDITOR);

  readonly addressTypeOptions = AddressTypeOptions;
  readonly validatorRequired = Validators.required;

  isInternational: WritableSignal<boolean> = signal<boolean>(false);

  readonly form: FormGroup = this.fb.group({
    type: [AddressType.Residential as AddressType, Validators.required],
    is_primary: [false],

    country_id: [null as LookupItem | null, Validators.required],

    state_id: [null as LookupItem | null],
    city_id: [null as LookupItem | null],
    district: [''],
    street: [''],
    number: [''],
    postal_code: [''],
    complement: [''],

    state_name: [''],
    city_name: [''],
    address_line_1: [''],
    address_line_2: [''],

    notes: [''],
  });

  private static readonly NATIONAL_VALIDATORS: Record<string, ValidatorFn[]> = {
    state_id: [Validators.required],
    city_id: [Validators.required],
    street: [Validators.required, Validators.maxLength(200)],
    postal_code: [Validators.pattern(POSTAL_CODE_PATTERN), Validators.maxLength(20)],
  };

  private static readonly INTERNATIONAL_VALIDATORS: Record<string, ValidatorFn[]> = {
    address_line_1: [Validators.required, Validators.maxLength(200)],
  };

  constructor() {
    this.hydrateForm(this.item());
    this.applyLayout(this.detectInternational(this.form.get('country_id')?.value ?? null));

    this.form.get('country_id')!.valueChanges.subscribe((country: LookupItem | null) => {
      const wasInternational = this.isInternational();
      const isInternational = this.detectInternational(country);

      this.form.get('state_id')!.setValue(null, { emitEvent: false });
      this.form.get('city_id')!.setValue(null, { emitEvent: false });
      this.form.get('state_name')!.setValue('', { emitEvent: false });
      this.form.get('city_name')!.setValue('', { emitEvent: false });

      if (wasInternational !== isInternational) {
        if (isInternational) {
          this.form.get('district')!.setValue('', { emitEvent: false });
          this.form.get('street')!.setValue('', { emitEvent: false });
          this.form.get('number')!.setValue('', { emitEvent: false });
          this.form.get('postal_code')!.setValue('', { emitEvent: false });
          this.form.get('complement')!.setValue('', { emitEvent: false });
        } else {
          this.form.get('address_line_1')!.setValue('', { emitEvent: false });
          this.form.get('address_line_2')!.setValue('', { emitEvent: false });
        }
      }

      this.applyLayout(isInternational);
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const item = this.item();
    const merged: Address = {
      ...(item ?? ({ id: 0 } as Address)),
      ...this.form.getRawValue(),
    } as Address;

    this.editor.commit(merged);
  }

  cancel(): void {
    this.editor.close();
  }

  private detectInternational(country: LookupItem | null): boolean {
    const isoCode =
      (country?.meta?.['iso_code'] as string | undefined) ??
      this.item()?.country_iso_code;

    return !!isoCode && isoCode !== BRAZIL_ISO_CODE;
  }

  private applyLayout(isInternational: boolean): void {
    this.isInternational.set(isInternational);

    const active = isInternational
      ? AddressFormComponent.INTERNATIONAL_VALIDATORS
      : AddressFormComponent.NATIONAL_VALIDATORS;
    const inactive = isInternational
      ? AddressFormComponent.NATIONAL_VALIDATORS
      : AddressFormComponent.INTERNATIONAL_VALIDATORS;

    Object.entries(inactive).forEach(([field, validators]) => {
      const control = this.form.get(field);
      control?.removeValidators(validators);
      control?.updateValueAndValidity({ emitEvent: false });
    });

    Object.entries(active).forEach(([field, validators]) => {
      const control = this.form.get(field);
      control?.addValidators(validators);
      control?.updateValueAndValidity({ emitEvent: false });
    });
  }

  private hydrateForm(item: Address | null): void {
    if (!item) {
      return;
    }

    this.form.patchValue({
      type: item.type ?? AddressType.Residential,
      is_primary: item.is_primary ?? false,
      country_id: item.country_id ?? null,
      state_id: item.state_id ?? null,
      city_id: item.city_id ?? null,
      district: item.district ?? '',
      street: item.street ?? '',
      number: item.number ?? '',
      postal_code: item.postal_code ?? '',
      complement: item.complement ?? '',
      state_name: item.state_name ?? '',
      city_name: item.city_name ?? '',
      address_line_1: item.address_line_1 ?? '',
      address_line_2: item.address_line_2 ?? '',
      notes: item.notes ?? '',
    }, { emitEvent: false });

    this.form.markAsUntouched();
    this.form.markAsPristine();
  }
}
