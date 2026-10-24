import { BaseEntity } from '../../../../core/models/base-entity';
import { MeasurementUnitCategory } from '../enums/measurement-unit-category';

export interface MeasurementUnit extends BaseEntity {
    code: string;
    name: string;
    symbol: string;
    category: MeasurementUnitCategory;
    base_unit_id?: number;
    conversion_factor?: number;
    decimal_places?: number;
    external_code?: string;
    is_active: boolean;
    is_system: boolean;
}
