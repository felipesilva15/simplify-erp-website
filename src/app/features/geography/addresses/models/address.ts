import { BaseEntity } from '../../../../core/models/base-entity';
import { LookupItem } from '../../../../core/models/lookup-item';
import { AddressType } from '../enums/address-type';

export interface Address extends BaseEntity {
    id: number;

    addressable_type?: string;
    addressable_id?: number;

    type: AddressType;
    is_primary: boolean;

    country_id: number | LookupItem | null;
    country_iso_code?: string;

    state_id: number | LookupItem | null;
    city_id: number | LookupItem | null;

    district?: string;
    street?: string;
    number?: string;
    postal_code?: string;
    complement?: string;

    state_name?: string;
    city_name?: string;
    address_line_1?: string;
    address_line_2?: string;

    notes?: string;

    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
