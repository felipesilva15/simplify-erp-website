export enum AddressType {
    Billing = 'BILLING',
    Delivery = 'DELIVERY',
    Residential = 'RESIDENTIAL',
    Work = 'WORK'
}

export const AddressTypeLabels: Record<AddressType, string> = {
    [AddressType.Billing]: 'Cobrança',
    [AddressType.Delivery]: 'Entrega',
    [AddressType.Residential]: 'Residencial',
    [AddressType.Work]: 'Comercial'
};

export const AddressTypeOptions: { code: AddressType, name: string }[] = (Object.keys(AddressType) as (keyof typeof AddressType)[])
.map(key => ({
    code: AddressType[key] as AddressType,
    name: AddressTypeLabels[AddressType[key] as AddressType],
}));
