export enum ItemTypeCode {
    MerchandiseForResale = '00',
    RawMaterial = '01',
    Packaging = '02',
    WorkInProcess = '03',
    FinishedProduct = '04',
    ByProduct = '05',
    IntermediateProduct = '06',
    ConsumableSupplies = '07',
    FixedAsset = '08',
    Service = '09',
    OtherInputs = '10',
    Other = '99',
}

export const ItemTypeCodeLabels: Record<ItemTypeCode, string> = {
    [ItemTypeCode.MerchandiseForResale]: 'Mercadoria para revenda',
    [ItemTypeCode.RawMaterial]: 'Matéria-prima',
    [ItemTypeCode.Packaging]: 'Embalagem',
    [ItemTypeCode.WorkInProcess]: 'Produto em processo',
    [ItemTypeCode.FinishedProduct]: 'Produto acabado',
    [ItemTypeCode.ByProduct]: 'Subproduto',
    [ItemTypeCode.IntermediateProduct]: 'Produto intermediário',
    [ItemTypeCode.ConsumableSupplies]: 'Material de uso e consumo',
    [ItemTypeCode.FixedAsset]: 'Ativo imobilizado',
    [ItemTypeCode.Service]: 'Serviços',
    [ItemTypeCode.OtherInputs]: 'Outros insumos',
    [ItemTypeCode.Other]: 'Outras',
};

export const ItemTypeCodeOptions: { code: ItemTypeCode, name: string }[] = (Object.keys(ItemTypeCode) as (keyof typeof ItemTypeCode)[])
.map(key => ({
    code: ItemTypeCode[key] as ItemTypeCode,
    name: ItemTypeCodeLabels[ItemTypeCode[key] as ItemTypeCode],
}));
