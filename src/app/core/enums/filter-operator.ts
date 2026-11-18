import { ColumnType } from "./column-type";

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

// Grupos reutilizáveis para evitar repetição
const COMPARABLE_OPERATORS: FilterOperator[] = [
    FilterOperator.Equal,
    FilterOperator.NotEqual,
    FilterOperator.GreaterThan,
    FilterOperator.GreaterThanEqual,
    FilterOperator.LessThan,
    FilterOperator.LessThanEqual,
];

const EXACT_OPERATORS: FilterOperator[] = [
    FilterOperator.Equal,
    FilterOperator.NotEqual,
];

// Mapeamento de operadores permitidos por tipo de coluna
export const ColumnFilterOperators: Record<ColumnType, FilterOperator[]> = {
    [ColumnType.Text]: [
        FilterOperator.Like,
        FilterOperator.Equal,
        FilterOperator.NotEqual,
    ],
    [ColumnType.Date]: COMPARABLE_OPERATORS,
    [ColumnType.Datetime]: COMPARABLE_OPERATORS,
    [ColumnType.Integer]: COMPARABLE_OPERATORS,
    [ColumnType.Decimal]: COMPARABLE_OPERATORS,
    [ColumnType.Currency]: COMPARABLE_OPERATORS,
    [ColumnType.Percent]: COMPARABLE_OPERATORS,
    [ColumnType.Boolean]: EXACT_OPERATORS,
    [ColumnType.Enum]: EXACT_OPERATORS,
    [ColumnType.Lookup]: EXACT_OPERATORS,
};

export interface FilterOperatorOption {
  code: FilterOperator;
  name: string;
}

export const FilterOperatorOptions: FilterOperatorOption[] = Object.values(FilterOperator).map(
  (operator) => ({
    code: operator,
    name: FilterOperatorLabels[operator],
  })
);

// Helper para obter as opções já formatadas para um tipo de coluna específico
export function getFilterOperatorOptionsByColumnType(
  columnType: ColumnType
): FilterOperatorOption[] {
  const operators = ColumnFilterOperators[columnType] ?? [];

  return operators.map((operator) => ({
    code: operator,
    name: FilterOperatorLabels[operator],
  }));
}