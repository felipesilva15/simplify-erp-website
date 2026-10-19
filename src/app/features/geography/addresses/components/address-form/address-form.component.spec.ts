import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';

import { AddressFormComponent } from './address-form.component';
import { Address } from '../../models/address';
import { AddressType } from '../../enums/address-type';
import { ChildItemEditor } from '../../../../../core/contracts/child-item-editor';
import { CHILD_FORM_ERRORS, CHILD_FORM_ITEM, CHILD_ITEM_EDITOR } from '../../../../../core/models/child-form-tokens';
import { ChildRowErrors } from '../../../../../core/models/child-row-errors';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { CountryService } from '../../../countries/services/country-service';
import { StateService } from '../../../states/services/state-service';
import { CityService } from '../../../cities/services/city-service';

describe('AddressFormComponent', () => {
  const brazilLookup: LookupItem = { key: 1, label: 'Brasil', meta: { iso_code: 'BR' } };
  const usaLookup: LookupItem = { key: 228, label: 'Estados Unidos', meta: { iso_code: 'US' } };

  const existingAddress: Address = {
    id: 9,
    type: AddressType.Billing,
    is_primary: true,
    country_id: brazilLookup as unknown as number,
    country_iso_code: 'BR',
    state_id: { key: 35, label: 'São Paulo' } as unknown as number,
    city_id: { key: 5503089, label: 'São Paulo' } as unknown as number,
    district: 'Centro',
    street: 'Avenida Paulista',
    number: '1000',
    postal_code: '01310-100',
    complement: 'Conj. 12',
    notes: 'Entrada pelos fundos',
  };

  let commit: ChildItemEditor<Address>['commit'];
  let close: ChildItemEditor<Address>['close'];

  function setup(item: Address | null): AddressFormComponent {
    commit = vi.fn();
    close = vi.fn();

    TestBed.configureTestingModule({
      imports: [AddressFormComponent],
      providers: [
        { provide: CHILD_ITEM_EDITOR, useValue: { commit, close } },
        { provide: CHILD_FORM_ITEM, useValue: signal<Address | null>(item) },
        {
          provide: CHILD_FORM_ERRORS,
          useValue: signal<ChildRowErrors>({ fields: {}, messages: [] }),
        },
        { provide: CountryService, useValue: {} },
        { provide: StateService, useValue: {} },
        { provide: CityService, useValue: {} },
      ],
    });

    const fixture = TestBed.createComponent(AddressFormComponent);
    fixture.detectChanges();

    return fixture.componentInstance;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('should start blank with the national layout when creating', () => {
    const component = setup(null);

    expect(component.item()).toBeNull();
    expect(component.isInternational()).toBe(false);
    expect(component.form.getRawValue()).toEqual({
      type: AddressType.Residential,
      is_primary: false,
      country_id: null,
      state_id: null,
      city_id: null,
      district: '',
      street: '',
      number: '',
      postal_code: '',
      complement: '',
      state_name: '',
      city_name: '',
      address_line_1: '',
      address_line_2: '',
      notes: '',
    });
  });

  it('should patch the item being edited and stay pristine', () => {
    const component = setup(existingAddress);

    expect(component.form.get('type')?.value).toBe(AddressType.Billing);
    expect(component.form.get('street')?.value).toBe('Avenida Paulista');
    expect(component.form.get('postal_code')?.value).toBe('01310-100');
    expect(component.form.get('is_primary')?.value).toBe(true);
    expect(component.form.pristine).toBe(true);
    expect(component.form.untouched).toBe(true);
  });

  it('should require state, city and street in the national layout', () => {
    const component = setup(null);

    component.form.patchValue({ country_id: brazilLookup });
    component.submit();

    expect(commit).not.toHaveBeenCalled();
    expect(component.form.get('state_id')?.errors?.['required']).toBeTruthy();
    expect(component.form.get('city_id')?.errors?.['required']).toBeTruthy();
    expect(component.form.get('street')?.errors?.['required']).toBeTruthy();
  });

  it('should reject an invalid postal code in the national layout', () => {
    const component = setup(null);

    component.form.patchValue({
      country_id: brazilLookup,
      state_id: { key: 35, label: 'São Paulo' },
      city_id: { key: 5503089, label: 'São Paulo' },
      street: 'Rua das Flores',
      postal_code: '123',
    });
    component.submit();

    expect(commit).not.toHaveBeenCalled();
    expect(component.form.get('postal_code')?.errors?.['pattern']).toBeTruthy();
  });

  it('should switch to the international layout when the country is not Brazil', () => {
    const component = setup(null);

    component.form.patchValue({ country_id: usaLookup });

    expect(component.isInternational()).toBe(true);
    expect(component.form.get('address_line_1')?.hasValidator(Validators.required)).toBe(true);
    expect(component.form.get('state_id')?.hasValidator(Validators.required)).toBe(false);
    expect(component.form.get('street')?.hasValidator(Validators.required)).toBe(false);
  });

  it('should require address_line_1 in the international layout', () => {
    const component = setup(null);

    component.form.patchValue({ country_id: usaLookup });
    component.submit();

    expect(commit).not.toHaveBeenCalled();
    expect(component.form.get('address_line_1')?.errors?.['required']).toBeTruthy();
  });

  it('should clear state/city when the country changes', () => {
    const component = setup(existingAddress);

    component.form.patchValue({ country_id: usaLookup });

    expect(component.form.get('state_id')?.value).toBeNull();
    expect(component.form.get('city_id')?.value).toBeNull();
  });

  it('should drop national-only fields when crossing to the international layout', () => {
    const component = setup(existingAddress);

    component.form.patchValue({ country_id: usaLookup });

    expect(component.form.get('street')?.value).toBe('');
    expect(component.form.get('postal_code')?.value).toBe('');
    expect(component.form.get('district')?.value).toBe('');
  });

  it('should detect the international layout from item.country_iso_code when the lookup has no meta', () => {
    const component = setup({
      id: 4,
      type: AddressType.Delivery,
      is_primary: false,
      country_id: { key: 228, label: 'Estados Unidos' } as unknown as number,
      country_iso_code: 'US',
      state_id: null,
      city_id: null,
      address_line_1: '5th Avenue',
    });

    expect(component.isInternational()).toBe(true);
  });

  it('should commit the merged item preserving the id', () => {
    const component = setup(existingAddress);

    component.form.patchValue({ number: '2000' });
    component.submit();

    expect(commit).toHaveBeenCalledWith({ ...existingAddress, ...component.form.getRawValue() });
  });

  it('should not commit an invalid form', () => {
    const component = setup(null);

    component.submit();

    expect(commit).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should close the editor on cancel', () => {
    const component = setup(existingAddress);

    component.cancel();

    expect(close).toHaveBeenCalled();
  });
});
