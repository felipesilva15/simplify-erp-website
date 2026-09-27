export enum Gender {
    Male = 'MALE',
    Female = 'FEMALE',
    Other = 'OTHER'
}

export const GenderLabels: Record<Gender, string> = {
    [Gender.Male]: 'Masculino',
    [Gender.Female]: 'Feminino',
    [Gender.Other]: 'Outro'
};
  
export const GenderOptions: { code: Gender, name: string }[] = (Object.keys(Gender) as (keyof typeof Gender)[])
.map(key => ({
    code: Gender[key] as Gender,
    name: GenderLabels[Gender[key] as Gender],
}));