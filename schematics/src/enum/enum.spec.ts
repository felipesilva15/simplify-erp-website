import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();

const ENUM_PATH =
  '/src/app/features/third-party/partner-types/enums/product-applicability.ts';

describe('enum schematic', () => {
  it('gera o arquivo de enumeração a partir de --fields', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'enum',
      {
        module: 'third-party',
        name: 'partner-type',
        fields:
          'applicability:enum:Aplicabilidade:ProductApplicability:PRODUCT=Produtos|SERVICE=Serviços|BOTH=Ambos',
      },
      tree,
    );

    expect(result.exists(ENUM_PATH)).toBe(true);

    const content = result.readContent(ENUM_PATH);
    expect(content).toContain('export enum ProductApplicability {');
    expect(content).toContain("Product = 'PRODUCT',");
    expect(content).toContain("Service = 'SERVICE',");
    expect(content).toContain("Both = 'BOTH',");
    expect(content).toContain("[ProductApplicability.Product]: 'Produtos',");
    expect(content).toContain('export const ProductApplicabilityLabels');
    expect(content).toContain('export const ProductApplicabilityOptions');
  });

  it('não gera nada quando não há campos enum', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'enum',
      { module: 'third-party', name: 'partner-type', fields: 'name:string:Nome' },
      tree,
    );

    expect(result.exists(ENUM_PATH)).toBe(false);
  });

  it('é idempotente para o mesmo conteúdo', async () => {
    const tree = createTree();
    const options = {
      module: 'third-party',
      name: 'partner-type',
      fields: 'applicability:enum:Aplicabilidade:ProductApplicability:PRODUCT=Produtos',
    };
    const first = await runner.runSchematic('enum', options, tree);
    const before = first.readContent(ENUM_PATH);
    const result = await runner.runSchematic('enum', options, first);

    expect(result.readContent(ENUM_PATH)).toBe(before);
  });
});
