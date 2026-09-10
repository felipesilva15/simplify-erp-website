export enum TaxpayerType {
    Taxpayer = 'TAXPAYER',
    NonTaxpayer = 'NON_TAXPAYER',
    Exempt = 'EXEMPT'
}

export const TaxpayerTypeLabels: Record<TaxpayerType, string> = {
    [TaxpayerType.Taxpayer]: 'Contribuinte',
    [TaxpayerType.NonTaxpayer]: 'Não contribuinte',
    [TaxpayerType.Exempt]: 'Isento'
};
  
export const TaxpayerTypeOptions: { code: TaxpayerType, name: string }[] = (Object.keys(TaxpayerType) as (keyof typeof TaxpayerType)[])
.map(key => ({
    code: TaxpayerType[key] as TaxpayerType,
    name: TaxpayerTypeLabels[TaxpayerType[key] as TaxpayerType],
}));