import { BaseEntity } from '../../../../core/models/base-entity';
import { ProductApplicability } from '../enums/product-applicability';

export interface ProductCategory extends BaseEntity {
    name: string;
    parent_category_id: number;
    applicability: ProductApplicability;
    is_active: boolean;
}
