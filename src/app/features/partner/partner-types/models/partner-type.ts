import { BaseEntity } from "../../../../core/models/base-entity";

export interface PartnerType extends BaseEntity {
    id: number;
    name: string;
    code: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}
