import { InjectionToken } from '@angular/core';
import { ChildEntityListConfig } from '../../../../core/models/child-entity-list-config';
import { ChildEntityViewMode } from '../../../../core/enums/child-entity-view-mode';
import { ColumnType } from '../../../../core/enums/column-type';
import { DialogSize } from '../../../../core/enums/dialog-size';
import { LookupItem } from '../../../../core/models/lookup-item';
import { ChildEntityListFacade } from '../../../../shared/facades/child-entity-list.facade';
import { AddressFormComponent } from '../components/address-form/address-form.component';
import { AddressType, AddressTypeLabels } from '../enums/address-type';
import { Address } from '../models/address';

function toLookupItem(id: number | LookupItem | null, label?: string, isoCode?: string): LookupItem | null {
    if (id == null) {
        return null;
    }

    if (typeof id !== 'number') {
        return id;
    }

    return {
        key: id,
        label: label ?? String(id),
        meta: isoCode ? { iso_code: isoCode } : undefined,
    };
}

export const ADDRESSES_LIST_CONFIG: ChildEntityListConfig<Address> = {
    arrayKey: 'addresses',
    viewMode: ChildEntityViewMode.ReadonlyTableModal,
    itemLabel: 'endereço',
    itemsLabel: '',
    columns: [
        { field: 'type', header: 'Tipo', type: ColumnType.Enum, enumOptionLabels: AddressTypeLabels },
        { field: 'street', header: 'Logradouro' },
        { field: 'number', header: 'Número' },
        { field: 'district', header: 'Bairro' },
        { field: 'postal_code', header: 'CEP' },
        { field: 'is_primary', header: 'Principal', type: ColumnType.Boolean },
    ],
    createItem: () => ({
        id: 0,
        type: AddressType.Residential,
        is_primary: false,
        country_id: null,
        state_id: null,
        city_id: null,
    }),
    formComponent: AddressFormComponent,
    dialogSize: DialogSize.Medium,
    removeConfirmMessage: (address: Address) =>
        `Deseja realmente remover o endereço "${address.street ?? ''}${address.number ? `, ${address.number}` : ''}"?`,
    hydrateItem: (item: Address) => ({
        ...item,
        country_id: toLookupItem(item.country_id, item.country_iso_code, item.country_iso_code),
        state_id: toLookupItem(item.state_id, item.state_name),
        city_id: toLookupItem(item.city_id, item.city_name),
    }),
};

export const ADDRESSES_LIST_FACADE = new InjectionToken<ChildEntityListFacade<Address>>(
    'ADDRESSES_LIST_FACADE'
);
