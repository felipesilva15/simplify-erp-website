import { DialogSize } from '../../../../core/enums/dialog-size';
import { AddressType } from '../enums/address-type';
import { Address } from '../models/address';
import { ADDRESSES_LIST_CONFIG } from './addresses-child-list.config';

describe('ADDRESSES_LIST_CONFIG', () => {
  it('should open the address form in a medium dialog', () => {
    expect(ADDRESSES_LIST_CONFIG.dialogSize).toBe(DialogSize.Medium);
  });

  it('should leave lookup keys primitive so the lookups can resolve their labels', () => {
    const address: Address = {
      id: 1,
      type: AddressType.Residential,
      is_primary: false,
      country_id: 1,
      country_iso_code: 'BR',
      state_id: 35,
      city_id: 5503089,
    };

    // Sem hydrateItem, o facade mantém os IDs primitivos e o CVA do lookup os
    // hidrata com label/meta vindos do endpoint /lookup.
    const hydrated = ADDRESSES_LIST_CONFIG.hydrateItem?.(address) ?? address;

    expect(hydrated.country_id).toBe(1);
    expect(hydrated.state_id).toBe(35);
    expect(hydrated.city_id).toBe(5503089);
  });
});
