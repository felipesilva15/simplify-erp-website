import { TestBed } from '@angular/core/testing';
import { CrudFormFacade } from './crud-form.facade';
import { PermissionService } from '../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../services/confirm-dialog-service';
import { ToastService } from '../services/toast-service';
import { Location } from '@angular/common';
import { CrudService } from '../../core/contracts/crud-service';
import { CrudFormConfig } from '../../core/models/crud-form-config';
import { BaseEntity } from '../../core/models/base-entity';
import { FormMode } from '../../core/enums/form-mode';
import { ApiMetaOption } from '../../core/enums/api-meta-option';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Mocked } from 'vitest';
import { of, throwError } from 'rxjs';
import { ApiResponse } from '../../core/models/api-response';
import { LookupItem } from '../../core/models/lookup-item';

interface TestEntity extends BaseEntity {
  name: string;
  category?: any;
}

describe('CrudFormFacade', () => {
  let facade: CrudFormFacade<TestEntity>;
  let mockCrudService: Mocked<CrudService<TestEntity>>;
  let mockPermissionService: Mocked<PermissionService>;
  let mockConfirmDialogService: Mocked<ConfirmDialogService>;
  let mockToastService: Mocked<ToastService>;
  let mockLocation: Mocked<Location>;
  let form: FormGroup;

  const defaultConfig: CrudFormConfig<TestEntity> = {
    permission: {
      create: 'perm-create',
      update: 'perm-update',
      view: 'perm-view',
    },
    successMessage: 'Salvo com sucesso!',
  };

  beforeEach(() => {
    vi.spyOn(window, 'scroll').mockImplementation(() => {});

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

    mockConfirmDialogService = {
      confirm: vi.fn().mockResolvedValue(true),
    } as unknown as Mocked<ConfirmDialogService>;

    mockToastService = {
      show: vi.fn(),
      clear: vi.fn(),
    } as unknown as Mocked<ToastService>;

    mockLocation = {
      back: vi.fn(),
    } as unknown as Mocked<Location>;

    form = new FormGroup({
      id: new FormControl(null),
      name: new FormControl('', Validators.required),
      category: new FormControl(null),
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Location, useValue: mockLocation },
      ],
    });

    facade = TestBed.runInInjectionContext(() => {
      return new CrudFormFacade<TestEntity>(mockCrudService, defaultConfig);
    });
  });

  it('should be created', () => {
    expect(facade).toBeTruthy();
  });

  it('should initialize signals with default values', () => {
    expect(facade.mode()).toBe(FormMode.CREATE);
    expect(facade.entity()).toBeNull();
    expect(facade.entityResponse()).toBeNull();
    expect(facade.loading()).toBe(false);
    expect(facade.saving()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.isCreate()).toBe(true);
    expect(facade.isEdit()).toBe(false);
    expect(facade.isView()).toBe(false);
    expect(facade.hasWarnings()).toBe(false);
  });

  describe('init', () => {
    it('should throw an error if the user does not have permission', () => {
      mockPermissionService.has.mockReturnValue(false);

      TestBed.runInInjectionContext(() => {
        expect(() => facade.init(FormMode.CREATE, form)).toThrow('Sem permissão para a ação.');
      });
      expect(mockPermissionService.has).toHaveBeenCalledWith('perm-create');
    });

    it('should allow access and not throw an error if config or permission configuration is missing', () => {
      const noPermFacade = TestBed.runInInjectionContext(() => {
        return new CrudFormFacade<TestEntity>(mockCrudService, {}); // empty config, no permissions
      });

      TestBed.runInInjectionContext(() => {
        expect(() => noPermFacade.init(FormMode.CREATE, form)).not.toThrow();
      });
    });

    it('should set mode and not load details for FormMode.CREATE', () => {
      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.CREATE, form);
      });

      expect(facade.mode()).toBe(FormMode.CREATE);
      expect(mockCrudService.edit).not.toHaveBeenCalled();
      expect(mockCrudService.get).not.toHaveBeenCalled();
    });

    it('should set mode and load details for FormMode.EDIT', () => {
      const apiResponse: ApiResponse<TestEntity> = {
        success: true,
        message: 'Success',
        data: { id: 1, name: 'Loaded Edit Item' },
      };
      mockCrudService.edit.mockReturnValue(of(apiResponse));

      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.EDIT, form, 1);
      });

      expect(facade.mode()).toBe(FormMode.EDIT);
      expect(mockCrudService.edit).toHaveBeenCalledWith(1);
      expect(facade.entity()).toEqual(apiResponse.data);
      expect(facade.entityResponse()).toEqual(apiResponse);
      expect(form.value.name).toBe('Loaded Edit Item');
    });

    it('should set mode and load details for FormMode.VIEW', () => {
      const apiResponse: ApiResponse<TestEntity> = {
        success: true,
        message: 'Success',
        data: { id: 2, name: 'Loaded View Item' },
      };
      mockCrudService.get.mockReturnValue(of(apiResponse));

      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.VIEW, form, 2);
      });

      expect(facade.mode()).toBe(FormMode.VIEW);
      expect(mockCrudService.get).toHaveBeenCalledWith(2);
      expect(facade.entity()).toEqual(apiResponse.data);
      expect(facade.entityResponse()).toEqual(apiResponse);
      expect(form.value.name).toBe('Loaded View Item');
    });

    it('should disable form in VIEW mode via effect', () => {
      const apiResponse: ApiResponse<TestEntity> = {
        success: true,
        message: 'Success',
        data: { id: 2, name: 'Loaded View Item' },
      };
      mockCrudService.get.mockReturnValue(of(apiResponse));

      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.VIEW, form, 2);
      });

      TestBed.flushEffects();

      expect(form.disabled).toBe(true);
    });

    it('should disable form in EDIT mode if editable metadata is false', () => {
      const apiResponse: ApiResponse<TestEntity> = {
        success: true,
        message: 'Success',
        data: { id: 1, name: 'Loaded Non-Editable Item' },
        meta: {
          [ApiMetaOption.Editable]: false,
        } as any,
      };
      mockCrudService.edit.mockReturnValue(of(apiResponse));

      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.EDIT, form, 1);
      });

      TestBed.flushEffects();

      expect(form.disabled).toBe(true);
    });

    it('should handle error when loading fails', () => {
      mockCrudService.edit.mockReturnValue(throwError(() => new Error('API Error')));

      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.EDIT, form, 1);
      });

      expect(facade.loading()).toBe(false);
      expect(facade.error()).toBe('Erro ao carregar registro');
    });
  });

  describe('submit', () => {
    it('should throw error and scroll to top when form is invalid', () => {
      form.controls['name'].setValue(''); // Invalid because it is required

      expect(() => facade.submit(form)).toThrow('Formulário inválido!');
      expect(window.scroll).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'smooth' });
    });

    it('should throw error when custom validSubmit returns false', () => {
      const customConfig: CrudFormConfig<TestEntity> = {
        validSubmit: vi.fn().mockReturnValue(false),
      };
      const customFacade = TestBed.runInInjectionContext(() => {
        return new CrudFormFacade<TestEntity>(mockCrudService, customConfig);
      });

      form.controls['name'].setValue('Valid Name');

      expect(() => customFacade.submit(form)).toThrow('Envio não é válido!');
    });

    it('should call beforeSubmit and service.create on CREATE mode, then process response', async () => {
      const beforeSubmitSpy = vi.fn().mockImplementation((payload) => ({
        ...payload,
        name: `${payload.name} Modified`,
      }));
      const afterSubmitSpy = vi.fn();
      const navigateAfterSaveSpy = vi.fn();

      const customConfig: CrudFormConfig<TestEntity> = {
        successMessage: 'Saved!',
        beforeSubmit: beforeSubmitSpy,
        afterSubmit: afterSubmitSpy,
        navigateAfterSave: navigateAfterSaveSpy,
      };

      const customFacade = TestBed.runInInjectionContext(() => {
        return new CrudFormFacade<TestEntity>(mockCrudService, customConfig);
      });

      form.controls['name'].setValue('Original Name');

      const apiResponse: ApiResponse<TestEntity> = {
        success: true,
        message: 'Created',
        data: { id: 10, name: 'Original Name Modified' },
      };
      mockCrudService.create.mockReturnValue(of(apiResponse));

      // Execute submit
      const result$ = customFacade.submit(form);
      const res = await new Promise<ApiResponse<TestEntity>>((resolve) => result$.subscribe(resolve));

      expect(customFacade.saving()).toBe(false);
      expect(beforeSubmitSpy).toHaveBeenCalledWith({ id: null, name: 'Original Name', category: null });
      expect(mockCrudService.create).toHaveBeenCalledWith({ id: null, name: 'Original Name Modified', category: null });
      expect(customFacade.entity()).toEqual(apiResponse.data);
      expect(afterSubmitSpy).toHaveBeenCalledWith(apiResponse.data);
      expect(mockToastService.show).toHaveBeenCalledWith({
        title: 'Sucesso',
        message: 'Saved!',
        severity: 'success',
      });
      expect(navigateAfterSaveSpy).toHaveBeenCalledWith(apiResponse.data);
      expect(form.pristine).toBe(true);
      expect(res).toEqual(apiResponse);
    });

    it('should call service.update in EDIT mode and navigateBack on success by default', async () => {
      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.EDIT, form);
      });

      form.controls['name'].setValue('Updated Name');

      const apiResponse: ApiResponse<TestEntity> = {
        success: true,
        message: 'Updated',
        data: { id: 1, name: 'Updated Name' },
      };
      mockCrudService.update.mockReturnValue(of(apiResponse));

      const result$ = facade.submit(form, 1);
      await new Promise((resolve) => result$.subscribe(resolve));

      expect(mockCrudService.update).toHaveBeenCalledWith(1, { id: null, name: 'Updated Name', category: null });
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('unwrapLookups', () => {
    it('should unwrap lookups in payload recursively', async () => {
      const lookupSingle: LookupItem = {
        key: 'cat1',
        label: 'Category 1',
        meta: { code: 'C1', active: true },
      };

      const lookupArray: LookupItem[] = [
        { key: 'tag1', label: 'Tag 1', meta: { id: 'T1' } },
        { key: 'tag2', label: 'Tag 2', meta: { id: 'T2' } },
      ];

      form.addControl('subObj', new FormControl({
        subLookup: lookupSingle,
        otherValue: 'xyz',
      }));

      form.patchValue({
        name: 'Unwrap Test',
        category: lookupSingle,
        subObj: {
          subLookup: lookupSingle,
          otherValue: 'xyz',
        },
      });

      // We will also add a control with an array of lookups
      form.addControl('tags', new FormControl(lookupArray));

      mockCrudService.create.mockReturnValue(of({ success: true, message: '', data: {} as any }));

      const result$ = facade.submit(form);
      await new Promise((resolve) => result$.subscribe(resolve));

      expect(mockCrudService.create).toHaveBeenCalledWith({
        id: null,
        name: 'Unwrap Test',
        category: { code: 'C1', active: true },
        subObj: {
          subLookup: { code: 'C1', active: true },
          otherValue: 'xyz',
        },
        tags: [{ id: 'T1' }, { id: 'T2' }],
      });
    });
  });

  describe('navigateBack and canDeactivate', () => {
    it('should go back immediately if form is not dirty', async () => {
      form.markAsPristine();
      facade.navigateBack(form);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should go back immediately if mode is VIEW', async () => {
      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.VIEW, form);
      });
      form.markAsDirty();

      facade.navigateBack(form);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should ask for confirmation if form is dirty and not navigate on reject', async () => {
      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.EDIT, form);
      });
      form.markAsDirty();
      mockConfirmDialogService.confirm.mockResolvedValue(false); // Reject

      facade.navigateBack(form);

      // Need to wait for promise resolution of canDeactivate
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockConfirmDialogService.confirm).toHaveBeenCalledWith({
        message: 'Existem alterações não salvas. Deseja mesmo sair?',
      });
      expect(mockLocation.back).not.toHaveBeenCalled();
    });

    it('should ask for confirmation if form is dirty and navigate on accept', async () => {
      TestBed.runInInjectionContext(() => {
        facade.init(FormMode.EDIT, form);
      });
      form.markAsDirty();
      mockConfirmDialogService.confirm.mockResolvedValue(true); // Accept

      facade.navigateBack(form);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockConfirmDialogService.confirm).toHaveBeenCalled();
      expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should navigate back without form check if form argument is omitted', () => {
      facade.navigateBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });
});
