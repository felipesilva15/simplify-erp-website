export enum FilterOperator {
    Equal = 'eq',
    Like = 'like',
    LessThan = 'lt',
    LessThanEqual = 'lte',
    GreaterThan = 'gt',
    GreaterThanEqual = 'gte',
    NotEqual = 'ne'
}

export const FilterOperatorLabels: Record<FilterOperator, string> = {
    [FilterOperator.Equal]: 'Igual',
    [FilterOperator.Like]: 'Contém',
    [FilterOperator.LessThan]: 'Menor',
    [FilterOperator.LessThanEqual]: 'Menor igual',
    [FilterOperator.GreaterThan]: 'Maior',
    [FilterOperator.GreaterThanEqual]: 'Maior igual',
    [FilterOperator.NotEqual]: 'Diferente'
};
  
export const FilterOperatorOptions: Array<{ code: FilterOperator, name: string }> = (Object.keys(FilterOperator) as Array<keyof typeof FilterOperator>)
.map(key => ({
    code: FilterOperator[key] as FilterOperator,
    name: FilterOperatorLabels[FilterOperator[key] as FilterOperator],
}));