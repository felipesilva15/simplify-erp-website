import { BaseEntity } from "../../../../core/models/base-entity";
import { State } from "../../states/models/state";

export interface City extends BaseEntity {
    name: string;
    uf: string;
    ibge_code: string;
    state_id: number;
    state: State;
}
