import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleFormPage } from './role-form.page';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { CrudFormFacade } from '../../../../../shared/facades/crud-form.facade';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { RoleService } from '../../services/role-service';
import { PermissionService } from '../../../../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../../../../../shared/services/confirm-dialog-service';
import { ToastService } from '../../../../../shared/services/toast-service';
import { Location } from '@angular/common';
import { FormMode } from '../../../../../core/enums/form-mode';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('RoleFormPage', () => {
  let component: RoleFormPage;
  let fixture: ComponentFixture<RoleFormPage>;

  let facadeMock: {
    init: ReturnType<typeof vi.fn>;
    submit: ReturnType<typeof vi.fn>;
    navigateBack: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof vi.fn>;
    saving: ReturnType<typeof vi.fn>;
    hasWarnings: ReturnType<typeof vi.fn>;
    entityResponse: ReturnType<typeof vi.fn>;
    entity: ReturnType<typeof vi.fn>;
  };

  let routeUtilsMock: { getFormModeFromCurrentUrl: ReturnType<typeof vi.fn> };
  let activatedRouteMock: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  function setupComponent(idParam: string | null, url: string, mode: FormMode) {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(idParam);
    routeUtilsMock.getFormModeFromCurrentUrl.mockReturnValue(mode);

    TestBed.configureTestingModule({
      imports: [RoleFormPage],
      providers: [
        provideRouter([{ path: '**', component: RoleFormPage }]),
        { provide: CrudFormFacade, useValue: facadeMock },
        { provide: RouteUtilsService, useValue: routeUtilsMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: RoleService, useValue: {} },
        { provide: PermissionService, useValue: { has: vi.fn().mockReturnValue(true), hasAny: vi.fn() } },
        { provide: ConfirmDialogService, useValue: { confirm: vi.fn().mockResolvedValue(true) } },
        { provide: ToastService, useValue: { show: vi.fn(), clear: vi.fn() } },
      ],
    })
      .overrideComponent(RoleFormPage, {
        remove: {
          providers: [{ provide: CrudFormFacade }],
        },
        add: {
          providers: [{ provide: CrudFormFacade, useValue: facadeMock }],
        },
      })
      .compileComponents();

    const router = TestBed.inject(Router);
    router.navigateByUrl(url);

    fixture = TestBed.createComponent(RoleFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.detectChanges();
  }

  beforeEach(() => {
    facadeMock = {
      init: vi.fn(),
      submit: vi.fn().mockReturnValue(of({ success: true, message: '', data: {} })),
      navigateBack: vi.fn(),
      loading: vi.fn().mockReturnValue(false),
      saving: vi.fn().mockReturnValue(false),
      hasWarnings: vi.fn().mockReturnValue(false),
      entityResponse: vi.fn().mockReturnValue(null),
      entity: vi.fn().mockReturnValue(null),
    };

    routeUtilsMock = { getFormModeFromCurrentUrl: vi.fn() };

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn(),
        },
      },
    };
  });

  describe('creation', () => {
    it('should create in CREATE mode', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      expect(component).toBeTruthy();
    });

    it('should create in EDIT mode', () => {
      setupComponent('1', '/security/roles/1/edit', FormMode.EDIT);
      expect(component).toBeTruthy();
    });

    it('should create in VIEW mode', () => {
      setupComponent('2', '/security/roles/2', FormMode.VIEW);
      expect(component).toBeTruthy();
    });
  });

  describe('constructor', () => {
    it('should set id from route params', () => {
      setupComponent('5', '/security/roles/5/edit', FormMode.EDIT);
      expect(component.id()).toBe(5);
    });

    it('should set id to 0 when no id param', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      expect(component.id()).toBe(0);
    });

    it('should set mode from routeUtilsService', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      expect(routeUtilsMock.getFormModeFromCurrentUrl).toHaveBeenCalled();
      expect(component.mode()).toBe(FormMode.CREATE);
    });

    it('should call facade.init with correct arguments', () => {
      setupComponent('3', '/security/roles/3/edit', FormMode.EDIT);
      expect(facadeMock.init).toHaveBeenCalledWith(
        FormMode.EDIT,
        component.form,
        3
      );
    });
  });

  describe('breadcrumbItems', () => {
    it('should initialize breadcrumb items in CREATE mode', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      expect(component.breadcrumbItems.length).toBe(4);
      expect(component.breadcrumbItems[0]).toEqual({ label: 'Segurança' });
      expect(component.breadcrumbItems[1]).toEqual({ label: 'Perfis' });
      expect(component.breadcrumbItems[2]).toEqual({ label: 'Listar', routerLink: '/security/roles' });
      expect(component.breadcrumbItems[3].label).toBe('Incluir');
      expect(component.breadcrumbItems[3].routerLink).toBeDefined();
    });

    it('should initialize breadcrumb items in EDIT mode with id', () => {
      setupComponent('4', '/security/roles/4/edit', FormMode.EDIT);
      expect(component.breadcrumbItems.length).toBe(4);
      expect(component.breadcrumbItems[0]).toEqual({ label: 'Segurança' });
      expect(component.breadcrumbItems[1]).toEqual({ label: 'Perfis' });
      expect(component.breadcrumbItems[2]).toEqual({ label: 'Listar', routerLink: '/security/roles' });
      expect(component.breadcrumbItems[3].label).toBe('Editar (ID: 4)');
      expect(component.breadcrumbItems[3].routerLink).toBeDefined();
    });

    it('should initialize breadcrumb items in VIEW mode with id', () => {
      setupComponent('7', '/security/roles/7', FormMode.VIEW);
      expect(component.breadcrumbItems.length).toBe(4);
      expect(component.breadcrumbItems[0]).toEqual({ label: 'Segurança' });
      expect(component.breadcrumbItems[1]).toEqual({ label: 'Perfis' });
      expect(component.breadcrumbItems[2]).toEqual({ label: 'Listar', routerLink: '/security/roles' });
      expect(component.breadcrumbItems[3].label).toBe('Visualizar (ID: 7)');
      expect(component.breadcrumbItems[3].routerLink).toBeDefined();
    });
  });

  describe('signals and computed', () => {
    it('should compute modeLabel for CREATE mode', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      expect(component.modeLabel()).toBe('Incluir');
    });

    it('should compute modeLabel for EDIT mode', () => {
      setupComponent('1', '/security/roles/1/edit', FormMode.EDIT);
      expect(component.modeLabel()).toBe('Editar');
    });

    it('should compute modeLabel for VIEW mode', () => {
      setupComponent('1', '/security/roles/1', FormMode.VIEW);
      expect(component.modeLabel()).toBe('Visualizar');
    });

    it('should compute title for CREATE mode', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      expect(component.title()).toBe('Incluir perfil');
    });

    it('should compute title for EDIT mode', () => {
      setupComponent('1', '/security/roles/1/edit', FormMode.EDIT);
      expect(component.title()).toBe('Editar perfil');
    });

    it('should compute title for VIEW mode', () => {
      setupComponent('1', '/security/roles/1', FormMode.VIEW);
      expect(component.title()).toBe('Visualizar perfil');
    });

    it('should compute activeBreadcrumbItemLabel with id', () => {
      setupComponent('3', '/security/roles/3/edit', FormMode.EDIT);
      expect(component.activeBreadcrumbItemLabel()).toBe('Editar (ID: 3)');
    });

    it('should compute activeBreadcrumbItemLabel without id', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      expect(component.activeBreadcrumbItemLabel()).toBe('Incluir');
    });
  });

  describe('form', () => {
    beforeEach(() => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
    });

    it('should have name and description controls', () => {
      expect(component.form.get('name')).toBeTruthy();
      expect(component.form.get('description')).toBeTruthy();
    });

    it('should have required validator on name', () => {
      component.form.get('name')!.setValue('');
      expect(component.form.get('name')!.hasError('required')).toBe(true);
    });

    it('should have maxLength(80) validator on name', () => {
      component.form.get('name')!.setValue('a'.repeat(81));
      expect(component.form.get('name')!.hasError('maxlength')).toBe(true);
    });

    it('should be valid with name within limits', () => {
      component.form.get('name')!.setValue('Valid Name');
      expect(component.form.get('name')!.valid).toBe(true);
    });

    it('should have maxLength(512) validator on description', () => {
      component.form.get('description')!.setValue('a'.repeat(513));
      expect(component.form.get('description')!.hasError('maxlength')).toBe(true);
    });

    it('should be valid with empty description', () => {
      component.form.get('description')!.setValue('');
      expect(component.form.get('description')!.valid).toBe(true);
    });

    it('should have empty initial values', () => {
      expect(component.form.get('name')!.value).toBe('');
      expect(component.form.get('description')!.value).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('should call facade.submit with form and id', () => {
      setupComponent('2', '/security/roles/2/edit', FormMode.EDIT);
      component.onSubmit();
      expect(facadeMock.submit).toHaveBeenCalledWith(component.form, 2);
    });

    it('should call facade.submit with form and 0 when no id', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      component.onSubmit();
      expect(facadeMock.submit).toHaveBeenCalledWith(component.form, 0);
    });
  });

  describe('isInvalid', () => {
    beforeEach(() => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
    });

    it('should return false when control is pristine and valid', () => {
      expect(component.isInvalid('name')).toBe(false);
    });

    it('should return false when control is invalid but pristine', () => {
      component.form.get('name')!.setValue('');
      expect(component.isInvalid('name')).toBe(false);
    });

    it('should return true when control is invalid and dirty', () => {
      component.form.get('name')!.setValue('');
      component.form.get('name')!.markAsDirty();
      expect(component.isInvalid('name')).toBe(true);
    });

    it('should return true when control is invalid and touched', () => {
      component.form.get('name')!.setValue('');
      component.form.get('name')!.markAsTouched();
      expect(component.isInvalid('name')).toBe(true);
    });

    it('should return false when control is valid and dirty', () => {
      component.form.get('name')!.setValue('Valid Name');
      component.form.get('name')!.markAsDirty();
      expect(component.isInvalid('name')).toBe(false);
    });

    it('should return false when control is valid and touched', () => {
      component.form.get('name')!.setValue('Valid Name');
      component.form.get('name')!.markAsTouched();
      expect(component.isInvalid('name')).toBe(false);
    });

    it('should return true for description when invalid and touched', () => {
      component.form.get('description')!.setValue('a'.repeat(513));
      component.form.get('description')!.markAsTouched();
      expect(component.isInvalid('description')).toBe(true);
    });

    it('should return false for description when empty and touched', () => {
      component.form.get('description')!.setValue('');
      component.form.get('description')!.markAsTouched();
      expect(component.isInvalid('description')).toBe(false);
    });
  });

  describe('component provider factory', () => {
    it('should create CrudFormFacade via useFactory when not overridden', () => {
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);
      routeUtilsMock.getFormModeFromCurrentUrl.mockReturnValue(FormMode.CREATE);

      TestBed.configureTestingModule({
        imports: [RoleFormPage],
        providers: [
          provideRouter([{ path: '**', component: RoleFormPage }]),
          { provide: RouteUtilsService, useValue: routeUtilsMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
          { provide: RoleService, useValue: { create: vi.fn().mockReturnValue(of({})) } },
          { provide: PermissionService, useValue: { has: vi.fn().mockReturnValue(true), hasAny: vi.fn() } },
          { provide: ConfirmDialogService, useValue: { confirm: vi.fn().mockResolvedValue(true) } },
          { provide: ToastService, useValue: { show: vi.fn(), clear: vi.fn() } },
          { provide: Location, useValue: { back: vi.fn(), isCurrentPathEqualTo: vi.fn().mockReturnValue(false) } },
        ],
      }).compileComponents();

      const router = TestBed.inject(Router);
      router.navigateByUrl('/security/roles/new');

      const fixture = TestBed.createComponent(RoleFormPage);
      expect(fixture.componentInstance.facade).toBeInstanceOf(CrudFormFacade);
    });
  });

  describe('template rendering', () => {
    it('should show form when not loading', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      expect(native.querySelector('form')).toBeTruthy();
      expect(native.querySelector('#name')).toBeTruthy();
      expect(native.querySelector('#description')).toBeTruthy();
    });

    it('should show skeleton when loading', () => {
      facadeMock.loading = vi.fn().mockReturnValue(true);
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      expect(native.querySelector('p-skeleton')).toBeTruthy();
      expect(native.querySelector('form')).toBeFalsy();
    });

    it('should show required validation message for name', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      component.form.get('name')!.setValue('');
      component.form.get('name')!.markAsDirty();
      fixture.detectChanges();
      const native = fixture.nativeElement as HTMLElement;
      expect(native.textContent).toContain('Este campo é obrigatório(a).');
    });

    it('should show maxlength validation message for name', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      component.form.get('name')!.setValue('a'.repeat(81));
      component.form.get('name')!.markAsDirty();
      fixture.detectChanges();
      const native = fixture.nativeElement as HTMLElement;
      expect(native.textContent).toContain('no máximo 80 caracteres');
    });

    it('should show maxlength validation message for description', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      component.form.get('description')!.setValue('a'.repeat(513));
      component.form.get('description')!.markAsDirty();
      fixture.detectChanges();
      const native = fixture.nativeElement as HTMLElement;
      expect(native.textContent).toContain('no máximo 512 caracteres');
    });

    it('should show warnings when facade has warnings', () => {
      facadeMock.hasWarnings = vi.fn().mockReturnValue(true);
      facadeMock.entityResponse = vi.fn().mockReturnValue({
        warnings: ['Warning 1', 'Warning 2']
      });
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      const messages = native.querySelectorAll('p-message[severity="warn"]');
      expect(messages.length).toBe(2);
    });

    it('should show save and back buttons', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      const buttons = native.querySelectorAll('p-button');
      const labels = Array.from(buttons).map(b => b.getAttribute('label'));
      expect(labels).toContain('Salvar');
      expect(labels).toContain('Voltar');
    });

    it('should trigger onSubmit when form is submitted', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      const form = native.querySelector('form')!;
      form.dispatchEvent(new Event('submit'));
      expect(facadeMock.submit).toHaveBeenCalled();
    });

    it('should render title from component', () => {
      setupComponent(null, '/security/roles/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      expect(native.querySelector('h2')?.textContent).toContain('Incluir perfil');
    });
  });
});
