import { BaseEntity } from "../../../../core/models/base-entity";

export interface Country extends BaseEntity {
    name: string;
    iso_code: string;
}
