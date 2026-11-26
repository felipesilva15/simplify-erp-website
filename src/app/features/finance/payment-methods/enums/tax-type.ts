export enum TaxType {
    Aliquot = 'ALIQUOT',
    FixedValue = 'FIXED_VALUE',
    FixedValueAndAliquot = 'FIXED_VALUE_AND_ALIQUOT',
}

export const TaxTypeLabels: Record<TaxType, string> = {
    [TaxType.Aliquot]: 'Alíquota',
    [TaxType.FixedValue]: 'Valor fixo',
    [TaxType.FixedValueAndAliquot]: 'Valor fixo e alíquota',
};

export const TaxTypeOptions: { code: TaxType, name: string }[] = (Object.keys(TaxType) as (keyof typeof TaxType)[])
.map(key => ({
    code: TaxType[key] as TaxType,
    name: TaxTypeLabels[TaxType[key] as TaxType],
}));
