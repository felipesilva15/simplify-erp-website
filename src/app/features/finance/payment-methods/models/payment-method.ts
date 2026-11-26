import { BaseEntity } from '../../../../core/models/base-entity';
import { PaymentType } from '../enums/payment-type';
import { FinanceApplicability } from '../enums/finance-applicability';
import { TaxType } from '../enums/tax-type';

export interface PaymentMethod extends BaseEntity {
    name: string;
    condition: string;
    payment_type: PaymentType;
    applicable_type: FinanceApplicability;
    tax_type?: TaxType;
    tax_aliquot?: number;
    tax_fixed_value?: number;
    penalty_aliquot?: number;
    interest_aliquot?: number;
    payment_deadline?: number;
}
