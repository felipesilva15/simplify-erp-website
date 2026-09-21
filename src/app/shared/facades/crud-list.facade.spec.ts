import { TestBed } from '@angular/core/testing';
import { CrudListFacade } from './crud-list.facade';
import { PermissionService } from '../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../services/confirm-dialog-service';
import { CrudService } from '../../core/contracts/crud-service';
import { CrudPermissionDefinition } from '../../core/models/crud-permission-definition';
import { BaseEntity } from '../../core/models/base-entity';
import { Mocked } from 'vitest';
import { of, throwError } from 'rxjs';
import { ApiMetaOption } from '../../core/enums/api-meta-option';
import { ApiResponse } from '../../core/models/api-response';
import { FilterOperator } from '../../core/enums/filter-operator';
import { RequestFiltersType } from '../../core/types/request-filters-type';
import { ExportMenuItem } from '../../core/models/export-menu-item';
import { ExportExtension } from '../../core/enums/export-extension';
import { ExportFormat } from '../../core/enums/export-format';
import { ExportableService } from '../../core/contracts/exportable-service';

interface TestEntity extends BaseEntity {
  name: string;
}

describe('CrudListFacade', () => {
  let facade: CrudListFacade<TestEntity>;
  let mockCrudService: Mocked<CrudService<TestEntity>>;
  let mockPermissionService: Mocked<PermissionService>;
  let mockConfirmService: Mocked<ConfirmDialogService>;
  const permissionDef: CrudPermissionDefinition = {
    view: 'view-perm',
    create: 'create-perm',
    update: 'update-perm',
    delete: 'delete-perm',
  };

  beforeEach(() => {
    mockCrudService = {
      list: vi.fn(),
      get: vi.fn(),
      edit: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as Mocked<CrudService<TestEntity>>;

    mockPermissionService = {
      has: vi.fn().mockReturnValue(true),
      hasAny: vi.fn(),
    } as unknown as Mocked<PermissionService>;

    mockConfirmService = {
      confirm: vi.fn().mockResolvedValue(true),
    } as unknown as Mocked<ConfirmDialogService>;

    TestBed.configureTestingModule({
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: ConfirmDialogService, useValue: mockConfirmService },
      ],
    });

    facade = TestBed.runInInjectionContext(() => {
      return new CrudListFacade<TestEntity>(mockCrudService, permissionDef);
    });
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should initialize with default states', () => {
    expect(facade.data()).toEqual([]);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.filterDefinitionVisible()).toBe(false);
    expect(facade.requestParams()).toBeUndefined();
    expect(facade.totalRecords()).toBe(0);
    expect(facade.response()).toBeNull();
    expect(facade.exportMenu()).toEqual([]);
  });

  it('should initialize exportMenu from config', () => {
    const exportMenu: ExportMenuItem[] = [
      {
        label: 'Excel completo',
        extension: ExportExtension.Xlsx,
        format: ExportFormat.Completo,
      },
    ];

    const configuredFacade = TestBed.runInInjectionContext(() => {
      return new CrudListFacade<TestEntity>(mockCrudService, permissionDef, { exportMenu });
    });

    expect(configuredFacade.exportMenu()).toEqual(exportMenu);
  });

  describe('load', () => {
    it('should set loading to true and fetch list with current request params', () => {
      const mockResponse: ApiResponse<TestEntity[]> = {
        success: true,
        message: 'Success',
        data: [{ id: 1, name: 'Item 1' }],
        meta: {
          [ApiMetaOption.Total]: 10,
        } as any,
      };

      mockCrudService.list.mockReturnValue(of(mockResponse));

      facade.load();

      expect(mockCrudService.list).toHaveBeenCalledWith(undefined);
      expect(facade.loading()).toBe(false);
      expect(facade.data()).toEqual([{ id: 1, name: 'Item 1' }]);
      expect(facade.totalRecords()).toBe(10);
      expect(facade.response()).toEqual(mockResponse);
    });

    it('should fallback totalRecords to data length if meta.total is not available', () => {
      const mockResponse: ApiResponse<TestEntity[]> = {
        success: true,
        message: 'Success',
        data: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
      };

      mockCrudService.list.mockReturnValue(of(mockResponse));

      facade.load();

      expect(facade.totalRecords()).toBe(2);
    });

    it('should handle error when fetching list fail', () => {
      mockCrudService.list.mockReturnValue(throwError(() => new Error('API Error')));

      facade.load();

      expect(facade.loading()).toBe(false);
      expect(facade.error()).toBe('Erro ao carregar registros.');
      expect(facade.data()).toEqual([]);
    });
  });

  describe('Filters Management', () => {
    it('should open filters', () => {
      facade.openFilters();
      expect(facade.filterDefinitionVisible()).toBe(true);
    });

    it('should change filter definition visibility', () => {
      facade.fitlersVisibleChange(true);
      expect(facade.filterDefinitionVisible()).toBe(true);

      facade.fitlersVisibleChange(false);
      expect(facade.filterDefinitionVisible()).toBe(false);
    });

    it('should apply filters and reload data when filters are provided', () => {
      const mockResponse: ApiResponse<TestEntity[]> = {
        success: true,
        message: 'Success',
        data: [],
      };
      mockCrudService.list.mockReturnValue(of(mockResponse));

      const filters: RequestFiltersType = {
        name: {
          [FilterOperator.Like]: 'search-term',
        },
      };
      facade.applyFilters(filters);

      expect(facade.requestParams()).toEqual({
        filters,
        page: 1,
      });
      expect(mockCrudService.list).toHaveBeenCalledWith({
        filters,
        page: 1,
      });
    });

    it('should remove filters from request params when null/undefined filters are applied', () => {
      const mockResponse: ApiResponse<TestEntity[]> = {
        success: true,
        message: 'Success',
        data: [],
      };
      mockCrudService.list.mockReturnValue(of(mockResponse));

      const filters: RequestFiltersType = {
        name: {
          [FilterOperator.Like]: 'search-term',
        },
      };

      // Initial filter apply
      facade.applyFilters(filters);

      // Clear filters
      facade.applyFilters(undefined);

      expect(facade.requestParams()).toEqual({
        page: 1,
      });
    });
  });

  describe('Lazy Loading', () => {
    it('should apply lazy load parameters and trigger list fetch', () => {
      const mockResponse: ApiResponse<TestEntity[]> = {
        success: true,
        message: 'Success',
        data: [],
      };
      mockCrudService.list.mockReturnValue(of(mockResponse));

      facade.applyLazyLoad(2, 20, 'name:asc');

      expect(facade.requestParams()).toEqual({
        page: 2,
        per_page: 20,
        sorts: 'name:asc',
      });
      expect(mockCrudService.list).toHaveBeenCalledWith({
        page: 2,
        per_page: 20,
        sorts: 'name:asc',
      });
    });
  });

  describe('export', () => {
    it('should set error when service does not implement ExportableService', () => {
      facade.export(ExportFormat.Completo, ExportExtension.Xlsx);

      expect(facade.error()).toBe('Exportação não disponível para este recurso.');
    });

    it('should call service export with current request params and trigger download', () => {
      const exportSpy = vi.fn().mockReturnValue(of(new Blob(['data'])));
      const exportableService = {
        ...mockCrudService,
        list: vi.fn().mockReturnValue(of({ success: true, message: 'ok', data: [] } as ApiResponse<TestEntity[]>)),
        export: exportSpy,
      } as unknown as Mocked<ExportableService & CrudService<TestEntity>>;

      const exportableFacade = TestBed.runInInjectionContext(() => {
        return new CrudListFacade<TestEntity>(exportableService, permissionDef);
      });

      exportableFacade.applyLazyLoad(2, 20, 'name:asc');

      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      const createObjectUrlSpy = vi.fn().mockReturnValue('blob:mock');
      const revokeObjectUrlSpy = vi.fn();
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      URL.createObjectURL = createObjectUrlSpy as typeof URL.createObjectURL;
      URL.revokeObjectURL = revokeObjectUrlSpy as typeof URL.revokeObjectURL;

      try {
        exportableFacade.export(ExportFormat.Completo, ExportExtension.Xlsx);

        expect(exportSpy).toHaveBeenCalledWith({
          page: 2,
          per_page: 20,
          sorts: 'name:asc',
          format: ExportFormat.Completo,
          extension: ExportExtension.Xlsx,
        });
        expect(createObjectUrlSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        expect(revokeObjectUrlSpy).toHaveBeenCalled();
      } finally {
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
        clickSpy.mockRestore();
      }
    });

    it('should call the default service export preserving the service as this context', () => {
      const exportableService = {
        ...mockCrudService,
        list: vi.fn().mockReturnValue(of({ success: true, message: 'ok', data: [] } as ApiResponse<TestEntity[]>)),
        export: vi.fn(function (this: unknown) {
          expect(this).toBe(exportableService);
          return of(new Blob(['data']));
        }),
      } as unknown as Mocked<ExportableService & CrudService<TestEntity>>;

      const exportableFacade = TestBed.runInInjectionContext(() => {
        return new CrudListFacade<TestEntity>(exportableService, permissionDef);
      });

      exportableFacade.export(ExportFormat.Completo, ExportExtension.Xlsx);
    });

    it('should set error when export fails', () => {
      const exportableService = {
        ...mockCrudService,
        export: vi.fn().mockReturnValue(throwError(() => new Error('API Error'))),
      } as unknown as Mocked<ExportableService & CrudService<TestEntity>>;

      const exportableFacade = TestBed.runInInjectionContext(() => {
        return new CrudListFacade<TestEntity>(exportableService, permissionDef);
      });

      exportableFacade.export(ExportFormat.Resumido, ExportExtension.Csv);

      expect(exportableFacade.error()).toBe('Erro ao exportar dados.');
    });

    it('should call the custom export handler with current request params and trigger download', () => {
      const handler = vi.fn().mockReturnValue(of(new Blob(['data'])));
      const customFacade = TestBed.runInInjectionContext(() => {
        return new CrudListFacade<TestEntity>(mockCrudService, permissionDef);
      });

      mockCrudService.list.mockReturnValue(of({ success: true, message: 'ok', data: [] } as ApiResponse<TestEntity[]>));
      customFacade.applyLazyLoad(2, 20, 'name:asc');

      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      const createObjectUrlSpy = vi.fn().mockReturnValue('blob:mock');
      const revokeObjectUrlSpy = vi.fn();
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      URL.createObjectURL = createObjectUrlSpy as typeof URL.createObjectURL;
      URL.revokeObjectURL = revokeObjectUrlSpy as typeof URL.revokeObjectURL;

      try {
        customFacade.exportCustom(ExportFormat.Completo, ExportExtension.Xlsx, handler);

        expect(handler).toHaveBeenCalledWith({
          page: 2,
          per_page: 20,
          sorts: 'name:asc',
          format: ExportFormat.Completo,
          extension: ExportExtension.Xlsx,
        });
        expect(createObjectUrlSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        expect(revokeObjectUrlSpy).toHaveBeenCalled();
      } finally {
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
        clickSpy.mockRestore();
      }
    });

    it('should set error when custom export handler fails', () => {
      const handler = vi.fn().mockReturnValue(throwError(() => new Error('API Error')));
      const customFacade = TestBed.runInInjectionContext(() => {
        return new CrudListFacade<TestEntity>(mockCrudService, permissionDef);
      });

      customFacade.exportCustom(ExportFormat.Completo, ExportExtension.Csv, handler);

      expect(customFacade.error()).toBe('Erro ao exportar dados.');
    });
  });

  describe('delete', () => {
    const targetEntity: TestEntity = { id: 42, name: 'To Delete' };

    it('should not delete if the user does not have permission', async () => {
      mockPermissionService.has.mockReturnValue(false); // No permission

      await facade.delete(targetEntity);

      expect(mockConfirmService.confirm).not.toHaveBeenCalled();
      expect(mockCrudService.delete).not.toHaveBeenCalled();
    });

    it('should not delete if confirm dialog is rejected', async () => {
      mockConfirmService.confirm.mockResolvedValue(false); // Reject

      await facade.delete(targetEntity);

      expect(mockConfirmService.confirm).toHaveBeenCalled();
      expect(mockCrudService.delete).not.toHaveBeenCalled();
    });

    it('should ask for confirmation and delete entity from remote and state on accept', async () => {
      // Setup initial state with data
      const mockResponse: ApiResponse<TestEntity[]> = {
        success: true,
        message: 'Success',
        data: [targetEntity, { id: 100, name: 'Keep Me' }],
      };
      mockCrudService.list.mockReturnValue(of(mockResponse));
      facade.load();

      // Mock delete service
      mockCrudService.delete.mockReturnValue(of(undefined));

      await facade.delete(targetEntity);

      expect(mockConfirmService.confirm).toHaveBeenCalledWith({
        message: 'Deseja realmente excluir o registro de ID 42?',
        acceptButtonProps: {
          severity: 'danger',
        },
      });
      expect(mockCrudService.delete).toHaveBeenCalledWith(42);
      expect(facade.data()).toEqual([{ id: 100, name: 'Keep Me' }]);
    });
  });

  describe('Permissions', () => {
    it('can should return true if no permission is provided', () => {
      expect(facade.can()).toBe(true);
      expect(facade.can('')).toBe(true);
      expect(mockPermissionService.has).not.toHaveBeenCalled();
    });

    it('can should delegate to permissionService if permission is defined', () => {
      mockPermissionService.has.mockReturnValue(false);
      expect(facade.can('custom-permission')).toBe(false);
      expect(mockPermissionService.has).toHaveBeenCalledWith('custom-permission');

      mockPermissionService.has.mockReturnValue(true);
      expect(facade.can('custom-permission')).toBe(true);
    });

    it('canCreate should delegate check for create permission', () => {
      facade.canCreate();
      expect(mockPermissionService.has).toHaveBeenCalledWith('create-perm');
    });

    it('canUpdate should delegate check for update permission', () => {
      facade.canUpdate();
      expect(mockPermissionService.has).toHaveBeenCalledWith('update-perm');
    });

    it('canDelete should delegate check for delete permission', () => {
      facade.canDelete();
      expect(mockPermissionService.has).toHaveBeenCalledWith('delete-perm');
    });

    it('canView should delegate check for view permission', () => {
      facade.canView();
      expect(mockPermissionService.has).toHaveBeenCalledWith('view-perm');
    });
  });
});
