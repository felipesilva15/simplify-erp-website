import { BaseEntity } from '../../../../core/models/base-entity';
import { FinanceApplicability } from '../../payment-methods/enums/finance-applicability';

export interface FinanceCategory extends BaseEntity {
    name: string;
    code?: string;
    parent_id: number;
    applicable_type: FinanceApplicability;
}
