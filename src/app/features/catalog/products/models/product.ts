import { BaseEntity } from '../../../../core/models/base-entity';
import { ItemTypeCode } from '../enums/item-type-code';
import { ProductType } from '../enums/product-type';

export interface Product extends BaseEntity {
    type: ProductType;
    item_type_code: ItemTypeCode;
    sku: string;
    gtin?: string;
    name: string;
    measurement_unit_id?: number;
    product_category_id?: number;
    product_brand_id?: number;
    description?: string;
    notes?: string;
    price: number;
    cost: number;
    net_weight?: number;
    gross_weight?: number;
    width?: number;
    height?: number;
    length?: number;
    minimum_stock?: number;
    maximum_stock?: number;
    is_active: boolean;
}
