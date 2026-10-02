import { BaseEntity } from "../../../../core/models/base-entity";

export interface State extends BaseEntity {
    name: string;
    uf: string;
    ibge_code: string;
}
