export enum ProductType {
    Product = 'PRODUCT',
    Service = 'SERVICE',
}

export const ProductTypeLabels: Record<ProductType, string> = {
    [ProductType.Product]: 'Produto',
    [ProductType.Service]: 'Serviço',
};

export const ProductTypeOptions: { code: ProductType, name: string }[] = (Object.keys(ProductType) as (keyof typeof ProductType)[])
.map(key => ({
    code: ProductType[key] as ProductType,
    name: ProductTypeLabels[ProductType[key] as ProductType],
}));
