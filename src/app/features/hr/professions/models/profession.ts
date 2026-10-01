import { BaseEntity } from "../../../../core/models/base-entity";

export interface Profession extends BaseEntity {
    name: string;
    cbo: string;
}
