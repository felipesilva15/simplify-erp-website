export enum FilterOperator {
    Equal = 'eq',
    Like = 'like',
    GreaterThan = 'gt',
    GreaterThanEqual = 'gte',
    LessThan = 'lt',
    LessThanEqual = 'lte',
    NotEqual = 'ne'
}

export const FilterOperatorLabels: Record<FilterOperator, string> = {
    [FilterOperator.Equal]: 'Igual',
    [FilterOperator.Like]: 'Contém',
    [FilterOperator.GreaterThan]: 'Maior',
    [FilterOperator.GreaterThanEqual]: 'Maior igual',
    [FilterOperator.LessThan]: 'Menor',
    [FilterOperator.LessThanEqual]: 'Menor igual',
    [FilterOperator.NotEqual]: 'Diferente'
};
  
export const FilterOperatorOptions: { code: FilterOperator, name: string }[] = (Object.keys(FilterOperator) as (keyof typeof FilterOperator)[])
.map(key => ({
    code: FilterOperator[key] as FilterOperator,
    name: FilterOperatorLabels[FilterOperator[key] as FilterOperator],
}));