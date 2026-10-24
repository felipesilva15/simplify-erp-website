export enum MeasurementUnitCategory {
    Count = 'COUNT',
    Mass = 'MASS',
    Volume = 'VOLUME',
    Length = 'LENGTH',
    Area = 'AREA',
    Time = 'TIME',
}

export const MeasurementUnitCategoryLabels: Record<MeasurementUnitCategory, string> = {
    [MeasurementUnitCategory.Count]: 'Contagem',
    [MeasurementUnitCategory.Mass]: 'Massa',
    [MeasurementUnitCategory.Volume]: 'Volume',
    [MeasurementUnitCategory.Length]: 'Comprimento',
    [MeasurementUnitCategory.Area]: 'Área',
    [MeasurementUnitCategory.Time]: 'Tempo',
};
  
export const MeasurementUnitCategoryOptions: { code: MeasurementUnitCategory, name: string }[] = (Object.keys(MeasurementUnitCategory) as (keyof typeof MeasurementUnitCategory)[])
.map(key => ({
    code: MeasurementUnitCategory[key] as MeasurementUnitCategory,
    name: MeasurementUnitCategoryLabels[MeasurementUnitCategory[key] as MeasurementUnitCategory],
}));