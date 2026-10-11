import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();

describe('model schematic', () => {
  it('gera a interface com os campos derivados de --fields', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'model',
      {
        module: 'third-party',
        name: 'partner-type',
        fields: 'name:string:Nome,active:boolean:Ativo,code:integer,started_at:date',
      },
      tree,
    );

    const model = result.readContent('/src/app/features/third-party/partner-types/models/partner-type.ts');
    expect(model).toContain("import { BaseEntity } from '../../../../core/models/base-entity';");
    expect(model).toContain('export interface PartnerType extends BaseEntity {');
    expect(model).toContain('name: string;');
    expect(model).toContain('active: boolean;');
    expect(model).toContain('code: number;');
    expect(model).toContain('started_at: Date;');
  });

  it('gera o campo padrão "name" quando --fields é omitido', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('model', { module: 'third-party', name: 'partner-type' }, tree);

    const model = result.readContent('/src/app/features/third-party/partner-types/models/partner-type.ts');
    expect(model).toContain('name: string;');
  });

  it('falha com mensagem clara para --fields malformado', async () => {
    const tree = createTree();
    await expect(
      runner.runSchematic('model', { module: 'third-party', name: 'partner-type', fields: 'nome-invalido' }, tree),
    ).rejects.toThrow(/Campo inválido em --fields/);
  });

  it('falha com mensagem clara para tipo desconhecido em --fields', async () => {
    const tree = createTree();
    await expect(
      runner.runSchematic('model', { module: 'third-party', name: 'partner-type', fields: 'age:uuid' }, tree),
    ).rejects.toThrow(/Tipo inválido em --fields/);
  });
});
