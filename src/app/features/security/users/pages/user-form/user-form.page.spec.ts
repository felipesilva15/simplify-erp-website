import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormPage } from './user-form.page';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { CrudFormFacade } from '../../../../../shared/facades/crud-form.facade';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { UserService } from '../../services/user-service';
import { RoleService } from '../../../roles/services/role-service';
import { PermissionService } from '../../../../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../../../../../shared/services/confirm-dialog-service';
import { ToastService } from '../../../../../shared/services/toast-service';
import { Location } from '@angular/common';
import { FormMode } from '../../../../../core/enums/form-mode';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('UserFormPage', () => {
  let component: UserFormPage;
  let fixture: ComponentFixture<UserFormPage>;

  let facadeMock: {
    init: ReturnType<typeof vi.fn>;
    submit: ReturnType<typeof vi.fn>;
    navigateBack: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof vi.fn>;
    saving: ReturnType<typeof vi.fn>;
    hasWarnings: ReturnType<typeof vi.fn>;
    entityResponse: ReturnType<typeof vi.fn>;
    entity: ReturnType<typeof vi.fn>;
    isCreate: ReturnType<typeof vi.fn>;
  };

  let routeUtilsMock: { getFormModeFromCurrentUrl: ReturnType<typeof vi.fn> };
  let activatedRouteMock: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };

  function setupComponent(idParam: string | null, url: string, mode: FormMode) {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue(idParam);
    routeUtilsMock.getFormModeFromCurrentUrl.mockReturnValue(mode);
    facadeMock.isCreate.mockReturnValue(mode === FormMode.CREATE);

    TestBed.configureTestingModule({
      imports: [UserFormPage],
      providers: [
        provideRouter([{ path: '**', component: UserFormPage }]),
        { provide: CrudFormFacade, useValue: facadeMock },
        { provide: RouteUtilsService, useValue: routeUtilsMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: UserService, useValue: {} },
        { provide: RoleService, useValue: {} },
        { provide: ConfirmDialogService, useValue: { confirm: vi.fn().mockResolvedValue(true) } },
        { provide: ToastService, useValue: { show: vi.fn(), clear: vi.fn() } },
      ],
    })
      .overrideComponent(UserFormPage, {
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

    fixture = TestBed.createComponent(UserFormPage);
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
      isCreate: vi.fn().mockReturnValue(true),
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
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      expect(component).toBeTruthy();
    });

    it('should create in EDIT mode', () => {
      setupComponent('1', '/security/users/1/edit', FormMode.EDIT);
      expect(component).toBeTruthy();
    });

    it('should create in VIEW mode', () => {
      setupComponent('2', '/security/users/2', FormMode.VIEW);
      expect(component).toBeTruthy();
    });
  });

  describe('constructor', () => {
    it('should set id from route params', () => {
      setupComponent('5', '/security/users/5/edit', FormMode.EDIT);
      expect(component.id()).toBe(5);
    });

    it('should set id to 0 when no id param', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      expect(component.id()).toBe(0);
    });

    it('should set mode from routeUtilsService', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      expect(routeUtilsMock.getFormModeFromCurrentUrl).toHaveBeenCalled();
      expect(component.mode()).toBe(FormMode.CREATE);
    });

    it('should call facade.init with correct arguments', () => {
      setupComponent('3', '/security/users/3/edit', FormMode.EDIT);
      expect(facadeMock.init).toHaveBeenCalledWith(
        FormMode.EDIT,
        component.form,
        3
      );
    });
  });

  describe('configureFormValidators', () => {
    it('should have required validator on password in CREATE mode', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      component.form.get('password')!.setValue('');
      expect(component.form.get('password')!.hasError('required')).toBe(true);
    });

    it('should have maxLength validator on password in CREATE mode', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      component.form.get('password')!.setValue('a'.repeat(256));
      expect(component.form.get('password')!.hasError('maxlength')).toBe(true);
    });

    it('should have required validator on password_confirmation in CREATE mode', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      component.form.get('password_confirmation')!.setValue('');
      expect(component.form.get('password_confirmation')!.hasError('required')).toBe(true);
    });

    it('should have maxLength validator on password_confirmation in CREATE mode', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      component.form.get('password_confirmation')!.setValue('a'.repeat(256));
      expect(component.form.get('password_confirmation')!.hasError('maxlength')).toBe(true);
    });

    it('should clear validators on password in EDIT mode', () => {
      setupComponent('1', '/security/users/1/edit', FormMode.EDIT);
      component.form.get('password')!.setValue('');
      expect(component.form.get('password')!.valid).toBe(true);
    });

    it('should clear validators on password_confirmation in EDIT mode', () => {
      setupComponent('1', '/security/users/1/edit', FormMode.EDIT);
      component.form.get('password_confirmation')!.setValue('');
      expect(component.form.get('password_confirmation')!.valid).toBe(true);
    });

    it('should clear validators on password in VIEW mode', () => {
      setupComponent('1', '/security/users/1', FormMode.VIEW);
      component.form.get('password')!.setValue('');
      expect(component.form.get('password')!.valid).toBe(true);
    });

    it('should clear validators on password_confirmation in VIEW mode', () => {
      setupComponent('1', '/security/users/1', FormMode.VIEW);
      component.form.get('password_confirmation')!.setValue('');
      expect(component.form.get('password_confirmation')!.valid).toBe(true);
    });
  });

  describe('breadcrumbItems', () => {
    it('should initialize breadcrumb items in CREATE mode', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      expect(component.breadcrumbItems.length).toBe(4);
      expect(component.breadcrumbItems[0]).toEqual({ label: 'Segurança' });
      expect(component.breadcrumbItems[1]).toEqual({ label: 'Perfis' });
      expect(component.breadcrumbItems[2]).toEqual({ label: 'Listar', routerLink: '/security/roles' });
      expect(component.breadcrumbItems[3].label).toBe('Incluir');
      expect(component.breadcrumbItems[3].routerLink).toBeDefined();
    });

    it('should initialize breadcrumb items in EDIT mode with id', () => {
      setupComponent('4', '/security/users/4/edit', FormMode.EDIT);
      expect(component.breadcrumbItems.length).toBe(4);
      expect(component.breadcrumbItems[0]).toEqual({ label: 'Segurança' });
      expect(component.breadcrumbItems[1]).toEqual({ label: 'Perfis' });
      expect(component.breadcrumbItems[2]).toEqual({ label: 'Listar', routerLink: '/security/roles' });
      expect(component.breadcrumbItems[3].label).toBe('Editar (ID: 4)');
      expect(component.breadcrumbItems[3].routerLink).toBeDefined();
    });

    it('should initialize breadcrumb items in VIEW mode with id', () => {
      setupComponent('7', '/security/users/7', FormMode.VIEW);
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
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      expect(component.modeLabel()).toBe('Incluir');
    });

    it('should compute modeLabel for EDIT mode', () => {
      setupComponent('1', '/security/users/1/edit', FormMode.EDIT);
      expect(component.modeLabel()).toBe('Editar');
    });

    it('should compute modeLabel for VIEW mode', () => {
      setupComponent('1', '/security/users/1', FormMode.VIEW);
      expect(component.modeLabel()).toBe('Visualizar');
    });

    it('should compute title for CREATE mode', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      expect(component.title()).toBe('Incluir perfil');
    });

    it('should compute title for EDIT mode', () => {
      setupComponent('1', '/security/users/1/edit', FormMode.EDIT);
      expect(component.title()).toBe('Editar perfil');
    });

    it('should compute title for VIEW mode', () => {
      setupComponent('1', '/security/users/1', FormMode.VIEW);
      expect(component.title()).toBe('Visualizar perfil');
    });

    it('should compute activeBreadcrumbItemLabel with id', () => {
      setupComponent('3', '/security/users/3/edit', FormMode.EDIT);
      expect(component.activeBreadcrumbItemLabel()).toBe('Editar (ID: 3)');
    });

    it('should compute activeBreadcrumbItemLabel without id', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      expect(component.activeBreadcrumbItemLabel()).toBe('Incluir');
    });
  });

  describe('form', () => {
    beforeEach(() => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
    });

    it('should have all form controls', () => {
      expect(component.form.get('name')).toBeTruthy();
      expect(component.form.get('username')).toBeTruthy();
      expect(component.form.get('email')).toBeTruthy();
      expect(component.form.get('phone_number')).toBeTruthy();
      expect(component.form.get('password')).toBeTruthy();
      expect(component.form.get('password_confirmation')).toBeTruthy();
      expect(component.form.get('roles')).toBeTruthy();
      expect(component.form.get('is_admin')).toBeTruthy();
    });

    it('should have required validator on name', () => {
      component.form.get('name')!.setValue('');
      expect(component.form.get('name')!.hasError('required')).toBe(true);
    });

    it('should have maxLength(255) validator on name', () => {
      component.form.get('name')!.setValue('a'.repeat(256));
      expect(component.form.get('name')!.hasError('maxlength')).toBe(true);
    });

    it('should be valid with name within limits', () => {
      component.form.get('name')!.setValue('Valid Name');
      expect(component.form.get('name')!.valid).toBe(true);
    });

    it('should have required validator on username', () => {
      component.form.get('username')!.setValue('');
      expect(component.form.get('username')!.hasError('required')).toBe(true);
    });

    it('should have maxLength(255) validator on username', () => {
      component.form.get('username')!.setValue('a'.repeat(256));
      expect(component.form.get('username')!.hasError('maxlength')).toBe(true);
    });

    it('should have required validator on email', () => {
      component.form.get('email')!.setValue('');
      expect(component.form.get('email')!.hasError('required')).toBe(true);
    });

    it('should have maxLength(80) validator on email', () => {
      component.form.get('email')!.setValue('a'.repeat(81));
      expect(component.form.get('email')!.hasError('maxlength')).toBe(true);
    });

    it('should have email validator on email', () => {
      component.form.get('email')!.setValue('invalid-email');
      expect(component.form.get('email')!.hasError('email')).toBe(true);
    });

    it('should be valid with valid email', () => {
      component.form.get('email')!.setValue('valid@email.com');
      expect(component.form.get('email')!.valid).toBe(true);
    });

    it('should have phone validator on phone_number', () => {
      component.form.get('phone_number')!.setValue('invalid');
      expect(component.form.get('phone_number')!.hasError('phone')).toBe(true);
    });

    it('should have empty initial values', () => {
      expect(component.form.get('name')!.value).toBe('');
      expect(component.form.get('username')!.value).toBe('');
      expect(component.form.get('email')!.value).toBe('');
      expect(component.form.get('phone_number')!.value).toBe('');
      expect(component.form.get('password')!.value).toBe('');
      expect(component.form.get('password_confirmation')!.value).toBe('');
      expect(component.form.get('roles')!.value).toEqual([]);
      expect(component.form.get('is_admin')!.value).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should call facade.submit with form and id', () => {
      setupComponent('2', '/security/users/2/edit', FormMode.EDIT);
      component.onSubmit();
      expect(facadeMock.submit).toHaveBeenCalledWith(component.form, 2);
    });

    it('should call facade.submit with form and 0 when no id', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      component.onSubmit();
      expect(facadeMock.submit).toHaveBeenCalledWith(component.form, 0);
    });
  });

  describe('isInvalid', () => {
    beforeEach(() => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
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

    it('should return true for email when invalid and touched', () => {
      component.form.get('email')!.setValue('invalid');
      component.form.get('email')!.markAsTouched();
      expect(component.isInvalid('email')).toBe(true);
    });

    it('should return false for email when valid and touched', () => {
      component.form.get('email')!.setValue('valid@email.com');
      component.form.get('email')!.markAsTouched();
      expect(component.isInvalid('email')).toBe(false);
    });

    it('should return false for non-existent control', () => {
      expect(component.isInvalid('nonexistent' as any)).toBe(false);
    });

    it('should return true when control is invalid and both dirty and touched', () => {
      component.form.get('name')!.setValue('');
      component.form.get('name')!.markAsDirty();
      component.form.get('name')!.markAsTouched();
      expect(component.isInvalid('name')).toBe(true);
    });
  });

  describe('component provider factory', () => {
    it('should create CrudFormFacade via useFactory when not overridden', () => {
      activatedRouteMock.snapshot.paramMap.get.mockReturnValue(null);
      routeUtilsMock.getFormModeFromCurrentUrl.mockReturnValue(FormMode.CREATE);

      TestBed.configureTestingModule({
        imports: [UserFormPage],
        providers: [
          provideRouter([{ path: '**', component: UserFormPage }]),
          { provide: RouteUtilsService, useValue: routeUtilsMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
          { provide: UserService, useValue: { create: vi.fn().mockReturnValue(of({})) } },
          { provide: RoleService, useValue: {} },
          { provide: PermissionService, useValue: { has: vi.fn().mockReturnValue(true), hasAny: vi.fn() } },
          { provide: ConfirmDialogService, useValue: { confirm: vi.fn().mockResolvedValue(true) } },
          { provide: ToastService, useValue: { show: vi.fn(), clear: vi.fn() } },
          { provide: Location, useValue: { back: vi.fn(), isCurrentPathEqualTo: vi.fn().mockReturnValue(false) } },
        ],
      }).compileComponents();

      const router = TestBed.inject(Router);
      router.navigateByUrl('/security/users/new');

      const fixture = TestBed.createComponent(UserFormPage);
      expect(fixture.componentInstance.facade).toBeInstanceOf(CrudFormFacade);
    });
  });

  describe('template rendering', () => {
    it('should show form when not loading', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      expect(native.querySelector('form')).toBeTruthy();
      expect(native.querySelector('#name')).toBeTruthy();
      expect(native.querySelector('#username')).toBeTruthy();
      expect(native.querySelector('#email')).toBeTruthy();
    });

    it('should show skeleton when loading', () => {
      facadeMock.loading = vi.fn().mockReturnValue(true);
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      expect(native.querySelector('p-skeleton')).toBeTruthy();
      expect(native.querySelector('form')).toBeFalsy();
    });

    it('should show required validation message for name', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      component.form.get('name')!.setValue('');
      component.form.get('name')!.markAsDirty();
      fixture.detectChanges();
      const native = fixture.nativeElement as HTMLElement;
      expect(native.textContent).toContain('obrigatório(a)');
    });

    it('should show warnings when facade has warnings', () => {
      facadeMock.hasWarnings = vi.fn().mockReturnValue(true);
      facadeMock.entityResponse = vi.fn().mockReturnValue({
        warnings: ['Warning 1', 'Warning 2']
      });
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      const messages = native.querySelectorAll('p-message[severity="warn"]');
      expect(messages.length).toBe(2);
    });

    it('should show save and back buttons', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      const buttons = native.querySelectorAll('p-button');
      const labels = Array.from(buttons).map(b => b.getAttribute('label'));
      expect(labels).toContain('Salvar');
      expect(labels).toContain('Voltar');
    });

    it('should trigger onSubmit when form is submitted', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      const form = native.querySelector('form')!;
      form.dispatchEvent(new Event('submit'));
      expect(facadeMock.submit).toHaveBeenCalled();
    });

    it('should render title from component', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      expect(native.querySelector('h2')?.textContent).toContain('Incluir perfil');
    });

    it('should show password fields in CREATE mode', () => {
      setupComponent(null, '/security/users/new', FormMode.CREATE);
      const native = fixture.nativeElement as HTMLElement;
      expect(native.querySelector('label[htmlFor="password"]')).toBeTruthy();
      expect(native.querySelector('label[htmlFor="password_confirmation"]')).toBeTruthy();
    });

    it('should hide password fields in EDIT mode', () => {
      setupComponent('1', '/security/users/1/edit', FormMode.EDIT);
      const native = fixture.nativeElement as HTMLElement;
      expect(native.querySelector('label[htmlFor="password"]')).toBeFalsy();
      expect(native.querySelector('label[htmlFor="password_confirmation"]')).toBeFalsy();
    });
  });
});
