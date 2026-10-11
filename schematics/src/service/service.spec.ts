import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();

describe('service schematic', () => {
  it('gera o service com os métodos do contrato CRUD', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('service', { module: 'third-party', name: 'partner-type' }, tree);

    const service = result.readContent(
      '/src/app/features/third-party/partner-types/services/partner-type-service.ts',
    );

    expect(service).toContain('export class PartnerTypeService implements CrudService<PartnerType>, LookupService, ExportableService');
    expect(service).toContain("environment.baseUrlApi + '/third-party/partner-types'");
    expect(service).toContain('edit(id: number): Observable<ApiResponse<PartnerType>>');
    expect(service).toContain('create(payload: Partial<PartnerType>)');
    expect(service).toContain('search(params: LookupFilter)');
    expect(service).toContain('export(params: ExportRequestParams)');
    expect(result.exists('/src/app/features/third-party/partner-types/services/partner-type-service.spec.ts')).toBe(true);
  });

  it('não gera spec com --skip-tests', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'service',
      { module: 'third-party', name: 'partner-type', 'skip-tests': true },
      tree,
    );

    expect(result.exists('/src/app/features/third-party/partner-types/services/partner-type-service.spec.ts')).toBe(false);
  });
});
