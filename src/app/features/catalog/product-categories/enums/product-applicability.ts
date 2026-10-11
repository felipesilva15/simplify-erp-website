export enum ProductApplicability {
    Product = 'PRODUCT',
    Service = 'SERVICE',
    Both = 'BOTH',
}

export const ProductApplicabilityLabels: Record<ProductApplicability, string> = {
    [ProductApplicability.Product]: 'Produtos',
    [ProductApplicability.Service]: 'Serviços',
    [ProductApplicability.Both]: 'Ambos',
};
  
export const ProductApplicabilityOptions: { code: ProductApplicability, name: string }[] = (Object.keys(ProductApplicability) as (keyof typeof ProductApplicability)[])
.map(key => ({
    code: ProductApplicability[key] as ProductApplicability,
    name: ProductApplicabilityLabels[ProductApplicability[key] as ProductApplicability],
}));