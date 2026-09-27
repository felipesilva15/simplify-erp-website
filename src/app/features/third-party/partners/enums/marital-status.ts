export enum MaritalStatus {
    Maried = 'MARIED',
    Widowed = 'WIDOWED',
    Single = 'SINGLE',
    Separated = 'SEPARATED',
    Divorced = 'DIVORCED'
}

export const MaritalStatusLabels: Record<MaritalStatus, string> = {
    [MaritalStatus.Maried]: 'Casado(a)',
    [MaritalStatus.Widowed]: 'Viúvo(a)',
    [MaritalStatus.Single]: 'Solteiro(a)',
    [MaritalStatus.Separated]: 'Separado(a)',
    [MaritalStatus.Divorced]: 'Divorciado(a)'
};
  
export const MaritalStatusOptions: { code: MaritalStatus, name: string }[] = (Object.keys(MaritalStatus) as (keyof typeof MaritalStatus)[])
.map(key => ({
    code: MaritalStatus[key] as MaritalStatus,
    name: MaritalStatusLabels[MaritalStatus[key] as MaritalStatus],
}));