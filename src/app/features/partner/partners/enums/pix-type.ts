export enum PixType {
    Email = 'EMAIL',
    Document = 'DOCUMENT',
    RandomKey = 'RANDOM_KEY',
    PhoneNumber = 'PHONE_NUMBER'
}

export const PixTypeLabels: Record<PixType, string> = {
    [PixType.Email]: 'E-mail',
    [PixType.Document]: 'CPF/CNPJ',
    [PixType.RandomKey]: 'Chave aleatória',
    [PixType.PhoneNumber]: 'Telefone'
};
  
export const PixTypeOptions: { code: PixType, name: string }[] = (Object.keys(PixType) as (keyof typeof PixType)[])
.map(key => ({
    code: PixType[key] as PixType,
    name: PixTypeLabels[PixType[key] as PixType],
}));