import { describe, expect, it } from 'vitest';
import { createRunner, createTree } from '../testing/helpers';

const runner = createRunner();

describe('service schematic', () => {
  it('gera o service com os métodos do contrato CRUD e LookupService (sem export por padrão)', async () => {
    const tree = createTree();
    const result = await runner.runSchematic('service', { module: 'third-party', name: 'partner-type' }, tree);

    const service = result.readContent(
      '/src/app/features/third-party/partner-types/services/partner-type-service.ts',
    );

    expect(service).toContain('export class PartnerTypeService implements CrudService<PartnerType>, LookupService');
    expect(service).not.toContain('ExportableService');
    expect(service).not.toContain('export(params: ExportRequestParams)');
    expect(service).not.toContain('LogableService');
    expect(service).not.toContain('activityLogs(id: number');
    expect(service).toContain("environment.baseUrlApi + '/third-party/partner-types'");
    expect(service).toContain('edit(id: number): Observable<ApiResponse<PartnerType>>');
    expect(service).toContain('create(payload: Partial<PartnerType>)');
    expect(service).toContain('search(params: LookupFilter)');
    expect(result.exists('/src/app/features/third-party/partner-types/services/partner-type-service.spec.ts')).toBe(true);
  });

  it('implementa ExportableService somente com --with-export', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'service',
      { module: 'third-party', name: 'partner-type', 'with-export': true },
      tree,
    );

    const service = result.readContent(
      '/src/app/features/third-party/partner-types/services/partner-type-service.ts',
    );

    expect(service).toContain(
      'export class PartnerTypeService implements CrudService<PartnerType>, LookupService, ExportableService',
    );
    expect(service).toContain('export(params: ExportRequestParams)');
    expect(service).toContain("import { ExportableService } from '../../../../core/contracts/exportable-service';");
  });

  it('implementa LogableService somente com --with-log', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'service',
      { module: 'third-party', name: 'partner-type', 'with-log': true },
      tree,
    );

    const service = result.readContent(
      '/src/app/features/third-party/partner-types/services/partner-type-service.ts',
    );

    expect(service).toContain(
      'export class PartnerTypeService implements CrudService<PartnerType>, LookupService, LogableService',
    );
    expect(service).toContain("import { LogableService } from '../../../../core/contracts/logable-service';");
    expect(service).toContain("import { ActivityLog } from '../../../../core/models/activity-log';");
    expect(service).toContain(
      'activityLogs(id: number, params?: ListRequestParams): Observable<ApiResponse<ActivityLog[]>>',
    );
    expect(service).toContain('`${this.baseUrl}/${id}/activity-logs`');
  });

  it('não implementa LookupService com --skip-lookup', async () => {
    const tree = createTree();
    const result = await runner.runSchematic(
      'service',
      { module: 'third-party', name: 'partner-type', 'skip-lookup': true },
      tree,
    );

    const service = result.readContent(
      '/src/app/features/third-party/partner-types/services/partner-type-service.ts',
    );

    expect(service).toContain('export class PartnerTypeService implements CrudService<PartnerType> {');
    expect(service).not.toContain('LookupService');
    expect(service).not.toContain('search(params: LookupFilter)');
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
