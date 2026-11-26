export enum FinanceApplicability {
    Credit = 'CREDIT',
    Debit = 'DEBIT',
    Both = 'BOTH',
}

export const FinanceApplicabilityLabels: Record<FinanceApplicability, string> = {
    [FinanceApplicability.Credit]: 'Crédito',
    [FinanceApplicability.Debit]: 'Débito',
    [FinanceApplicability.Both]: 'Ambos',
};

export const FinanceApplicabilityOptions: { code: FinanceApplicability, name: string }[] = (Object.keys(FinanceApplicability) as (keyof typeof FinanceApplicability)[])
.map(key => ({
    code: FinanceApplicability[key] as FinanceApplicability,
    name: FinanceApplicabilityLabels[FinanceApplicability[key] as FinanceApplicability],
}));
