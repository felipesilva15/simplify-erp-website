import { BaseEntity } from '../../../../core/models/base-entity';

export interface Warehouse extends BaseEntity {
    name: string;
    is_active: boolean;
}
