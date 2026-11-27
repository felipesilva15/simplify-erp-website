import { InjectionToken } from '@angular/core';
import { ChildEntityListConfig } from '../../../../core/models/child-entity-list-config';
import { ChildEntityViewMode } from '../../../../core/enums/child-entity-view-mode';
import { ColumnType } from '../../../../core/enums/column-type';
import { DialogSize } from '../../../../core/enums/dialog-size';
import { ChildEntityListFacade } from '../../../../shared/facades/child-entity-list.facade';
import { AddressFormComponent } from '../components/address-form/address-form.component';
import { AddressType, AddressTypeLabels } from '../enums/address-type';
import { Address } from '../models/address';

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
};

export const ADDRESSES_LIST_FACADE = new InjectionToken<ChildEntityListFacade<Address>>(
    'ADDRESSES_LIST_FACADE'
);
