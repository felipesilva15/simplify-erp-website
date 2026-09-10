export enum PersonType {
    Person = 'PERSON',
    Company = 'COMPANY',
    Foreign = 'FOREIGN'
}

export const PersonTypeLabels: Record<PersonType, string> = {
    [PersonType.Person]: 'Pessoa física',
    [PersonType.Company]: 'Empresa',
    [PersonType.Foreign]: 'Estrangeiro'
};
  
export const PersonTypeOptions: { code: PersonType, name: string }[] = (Object.keys(PersonType) as (keyof typeof PersonType)[])
.map(key => ({
    code: PersonType[key] as PersonType,
    name: PersonTypeLabels[PersonType[key] as PersonType],
}));