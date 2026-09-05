import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { Mocked } from 'vitest';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog-service';
import { PermissionService } from '../../../../core/auth/services/permission-service';
import { ToastService } from '../../../../shared/services/toast-service';
import { CrudService } from '../../../../core/contracts/crud-service';
import { FormMode } from '../../../../core/enums/form-mode';
import { ApiMetaOption } from '../../../../core/enums/api-meta-option';
import { ApiResponse } from '../../../../core/models/api-response';
import { Role } from '../models/role';
import { RolePermission } from '../models/role-permission';
import { RolePermissionState } from '../models/role-permission-state';
import { RolePermissionFormFacade } from './role-permission-form.facade';
import { RoleService } from '../services/role-service';
import { ModuleService } from '../../../configuration/modules/services/module-service';
import { Module } from '../../../configuration/modules/models/module';

describe('RolePermissionFormFacade', () => {
  let facade: RolePermissionFormFacade;
  let roleService: Mocked<RoleService>;
  let moduleService: Mocked<ModuleService>;
  let permissionService: Mocked<PermissionService>;
  let confirmDialogService: Mocked<ConfirmDialogService>;
  let toastService: Mocked<ToastService>;
  let location: Mocked<Location>;

  const now = new Date('2026-01-01T00:00:00.000Z');
  const permissions: RolePermission[] = [
    {
      id: 10,
      name: 'Listar',
      resource: { id: 3, name: 'Usuários', slug: 'users', module_id: 1 },
      action: 'view',
    },
    {
      id: 11,
      name: 'Criar',
      resource: { id: 3, name: 'Usuários', slug: 'users', module_id: 1 },
      action: 'create',
    },
  ];
  const role: Role = {
    id: 5,
    name: 'Administrador',
    permissions,
    created_at: now,
    updated_at: now,
  };
  const module: Module = {
    id: 1,
    name: 'Usuários',
    description: 'Gestão de usuários',
    slug: 'users',
    is_active: true,
    resources: [],
  };
  const state: RolePermissionState = { role, modules: [module] };

  beforeEach(() => {
    vi.spyOn(window, 'scroll').mockImplementation(() => {});

    roleService = {
      get: vi.fn(),
      edit: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
      search: vi.fn(),
      definePermissions: vi.fn(),
    } as unknown as Mocked<RoleService>;

    moduleService = {
      list: vi.fn(),
      get: vi.fn(),
    } as unknown as Mocked<ModuleService>;

    permissionService = {
      has: vi.fn().mockReturnValue(true),
      hasAny: vi.fn(),
    } as unknown as Mocked<PermissionService>;

    confirmDialogService = {
      confirm: vi.fn().mockResolvedValue(true),
    } as unknown as Mocked<ConfirmDialogService>;

    toastService = {
      show: vi.fn(),
      clear: vi.fn(),
    } as unknown as Mocked<ToastService>;

    location = {
      back: vi.fn(),
    } as unknown as Mocked<Location>;

    TestBed.configureTestingModule({
      providers: [
        { provide: RoleService, useValue: roleService },
        { provide: ModuleService, useValue: moduleService },
        { provide: PermissionService, useValue: permissionService },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
        { provide: ToastService, useValue: toastService },
        { provide: Location, useValue: location },
      ],
    });

    fixtureFacade();
  });

  function fixtureFacade(): void {
    TestBed.runInInjectionContext(() => {
      facade = new RolePermissionFormFacade(roleService as unknown as CrudService<Role>);
    });
  }

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should load role and modules together on edit', () => {
    const form = new FormGroup({
      ids: new FormControl<number[]>([]),
    });

    roleService.get.mockReturnValue(of({ success: true, message: '', data: role }));
    moduleService.list.mockReturnValue(of({ success: true, message: '', data: [module] }));

    TestBed.runInInjectionContext(() => {
      facade.init(FormMode.Edit, form, 5);
    });

    expect(roleService.get).toHaveBeenCalledWith(5);
    expect(moduleService.list).toHaveBeenCalledWith({
      filters: { is_active: { eq: 1 } },
      page: 1,
      per_page: 100,
    });
    expect(facade.entity()).toEqual(role);
    expect(facade.state()).toEqual(state);
    expect(form.value.ids).toEqual([10, 11]);
  });

  it('should preserve api metadata on load', () => {
    const form = new FormGroup({
      ids: new FormControl<number[]>([]),
    });

    roleService.get.mockReturnValue(
      of({
        success: true,
        message: '',
        data: role,
        warnings: ['aviso'],
        meta: {
          [ApiMetaOption.Editable]: false,
          [ApiMetaOption.CurrentPage]: 1,
          [ApiMetaOption.LastPage]: 1,
          [ApiMetaOption.PerPage]: 10,
          [ApiMetaOption.Total]: 0,
        },
      })
    );
    moduleService.list.mockReturnValue(of({ success: true, message: '', data: [module] }));

    TestBed.runInInjectionContext(() => {
      facade.init(FormMode.Edit, form, 5);
    });

    expect(facade.warnings()).toEqual(['aviso']);
    expect(facade.meta()).toEqual({
      [ApiMetaOption.Editable]: false,
      [ApiMetaOption.CurrentPage]: 1,
      [ApiMetaOption.LastPage]: 1,
      [ApiMetaOption.PerPage]: 10,
      [ApiMetaOption.Total]: 0,
    });
  });

  it('should build payload with selected permission ids', () => {
    const form = new FormGroup({
      ids: new FormControl<number[]>([10, 11]),
    });

    const payload = (facade as any).buildPayload(form) as { ids: number[] };

    expect(payload).toEqual({ ids: [10, 11] });
  });

  it('should persist via definePermissions with ids payload', async () => {
    const form = new FormGroup({
      ids: new FormControl<number[]>([10]),
    });
    const response: ApiResponse<Role> = { success: true, message: 'OK', data: role };
    roleService.definePermissions.mockReturnValue(of(response));

    const result$ = facade.submit(form, 5);
    const res = await new Promise<ApiResponse<Role>>(resolve => result$.subscribe(resolve));

    expect(roleService.definePermissions).toHaveBeenCalledWith(5, { ids: [10] });
    expect(res).toEqual(response);
  });

  it('should use id 0 when persisting without id', async () => {
    const form = new FormGroup({
      ids: new FormControl<number[]>([]),
    });
    roleService.definePermissions.mockReturnValue(of({ success: true, message: 'OK', data: role }));

    const result$ = facade.submit(form);
    await new Promise(resolve => result$.subscribe(resolve));

    expect(roleService.definePermissions).toHaveBeenCalledWith(0, { ids: [] });
  });

  it('should check the action permission on init', () => {
    const customFacade = TestBed.runInInjectionContext(() =>
      new RolePermissionFormFacade(roleService as unknown as CrudService<Role>, {
        successMessage: 'Registro salvo!',
        permission: { create: 'roles.create', update: 'roles.update', view: 'roles.view' },
      })
    );
    permissionService.has.mockReturnValue(false);

    expect(() => {
      TestBed.runInInjectionContext(() => {
        customFacade.init('PERMISSIONS' as FormMode, new FormGroup({ ids: new FormControl<number[]>([]) }), 5);
      });
    }).toThrow('Sem permissão para a ação.');

    expect(permissionService.has).toHaveBeenCalledWith('roles.definePermissions');
  });

  it('should resolve permission from config action when provided', () => {
    const customFacade = TestBed.runInInjectionContext(() =>
      new RolePermissionFormFacade(roleService as unknown as CrudService<Role>, {
        permission: { action: 'roles.customAction' },
      })
    );
    permissionService.has.mockReturnValue(false);

    expect(() => {
      TestBed.runInInjectionContext(() => {
        customFacade.init('PERMISSIONS' as FormMode, new FormGroup({ ids: new FormControl<number[]>([]) }), 5);
      });
    }).toThrow('Sem permissão para a ação.');

    expect(permissionService.has).toHaveBeenCalledWith('roles.customAction');
  });

  it('should load on init for a custom form mode when id is present', () => {
    const customFacade = TestBed.runInInjectionContext(() =>
      new RolePermissionFormFacade(roleService as unknown as CrudService<Role>, {
        permission: { action: 'roles.definePermissions' },
      })
    );
    const form = new FormGroup({
      ids: new FormControl<number[]>([]),
    });

    roleService.get.mockReturnValue(of({ success: true, message: '', data: role }));
    moduleService.list.mockReturnValue(of({ success: true, message: '', data: [module] }));

    TestBed.runInInjectionContext(() => {
      customFacade.init('PERMISSIONS' as FormMode, form, 5);
    });

    expect(roleService.get).toHaveBeenCalledWith(5);
    expect(customFacade.state()).toEqual(state);
  });

  it('should not load on init for a custom form mode without id', () => {
    const customFacade = TestBed.runInInjectionContext(() =>
      new RolePermissionFormFacade(roleService as unknown as CrudService<Role>, {
        permission: { action: 'roles.definePermissions' },
      })
    );

    TestBed.runInInjectionContext(() => {
      customFacade.init('PERMISSIONS' as FormMode, new FormGroup({ ids: new FormControl<number[]>([]) }));
    });

    expect(roleService.get).not.toHaveBeenCalled();
    expect(moduleService.list).not.toHaveBeenCalled();
  });
});