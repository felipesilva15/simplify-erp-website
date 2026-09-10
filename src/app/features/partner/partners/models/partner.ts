import { BaseEntity } from "../../../../core/models/base-entity";
import { Gender } from "../enums/gender";
import { MaritalStatus } from "../enums/marital-status";
import { PersonType } from "../enums/person-type";
import { PixType } from "../enums/pix-type";
import { TaxpayerType } from "../enums/taxpayer-type";

export interface Partner extends BaseEntity{
    id: number;
    name: string;
    trade_name: string;
    partner_type_code: string
    person_type: PersonType;
    taxpayer_type: TaxpayerType;
    document_number: string;
    identity_number?: string;
    identity_issuer?: string;
    partner_since?: Date;
    state_registration?: string;
    municipal_registration?: string;
    suframa_registration?: string;
    marital_status?: MaritalStatus;
    cbo?: string;
    gender?: Gender;
    birth_date?: Date;
    father_name?: string;
    father_document?: string;
    mother_name?: string;
    mother_document?: string;
    pix_type?: PixType;
    pix_key?: string;
    notes?: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
