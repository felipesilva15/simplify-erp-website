import { LoginPage } from './login.page';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/auth/services/auth-service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authServiceMock: { login: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authServiceMock = { login: vi.fn() };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginPage, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form with username and password controls', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('username')).toBeTruthy();
      expect(component.form.get('password')).toBeTruthy();
    });

    it('should have required validators on username and password', () => {
      const username = component.form.get('username')!;
      const password = component.form.get('password')!;

      username.setValue('');
      password.setValue('');

      expect(username.valid).toBe(false);
      expect(password.valid).toBe(false);
      expect(username.hasError('required')).toBe(true);
      expect(password.hasError('required')).toBe(true);
    });

    it('should be valid when both fields have values', () => {
      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      expect(component.form.valid).toBe(true);
    });
  });

  describe('wrapForm', () => {
    it('should populate requestData from form values', () => {
      component.form.get('username')!.setValue('testUser');
      component.form.get('password')!.setValue('testPass');

      component.wrapForm();

      expect(component.requestData).toEqual({
        username: 'testUser',
        password: 'testPass',
      });
    });
  });

  describe('onSubmit', () => {
    it('should mark all fields as touched and return early when form is invalid', () => {
      const markAllAsTouchedSpy = vi.spyOn(component.form, 'markAllAsTouched');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with form data when form is valid', () => {
      authServiceMock.login.mockReturnValue(of({ access_token: 'token', token_type: 'Bearer', expires_in: 3600 }));

      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(authServiceMock.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
    });

    it('should navigate to / on successful login when no redirectLink is set', () => {
      authServiceMock.login.mockReturnValue(of({ access_token: 'token', token_type: 'Bearer', expires_in: 3600 }));

      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to redirectLink on successful login when redirectLink is set', () => {
      authServiceMock.login.mockReturnValue(of({ access_token: 'token', token_type: 'Bearer', expires_in: 3600 }));

      component.redirectLink.set('/dashboard');
      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should set isSubmitting to true before login call', () => {
      authServiceMock.login.mockReturnValue(of({ access_token: 'token', token_type: 'Bearer', expires_in: 3600 }));

      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(component.isSubmitting()).toBe(true);
    });

    it('should clear errorMessage before login call', () => {
      authServiceMock.login.mockReturnValue(of({ access_token: 'token', token_type: 'Bearer', expires_in: 3600 }));

      component.errorMessage.set('previous error');
      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(component.errorMessage()).toBe('');
    });

    it('should set errorMessage from error.error.message on login error', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );

      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(component.errorMessage()).toBe('Invalid credentials');
    });

    it('should set fallback errorMessage when error has no error.message', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => ({ error: null }))
      );

      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(component.errorMessage()).toBe('Ocorreu um erro desconhecido. Entre em contato com o suporte do sistema.');
    });

    it('should set fallback errorMessage when error has no error property', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => ({}))
      );

      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(component.errorMessage()).toBe('Ocorreu um erro desconhecido. Entre em contato com o suporte do sistema.');
    });

    it('should set isSubmitting back to false on login error', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => ({ error: { message: 'fail' } }))
      );

      component.form.get('username')!.setValue('user');
      component.form.get('password')!.setValue('pass');

      component.onSubmit();

      expect(component.isSubmitting()).toBe(false);
    });
  });

  describe('signals', () => {
    it('should have isSubmitting default to false', () => {
      expect(component.isSubmitting()).toBe(false);
    });

    it('should have errorMessage default to empty string', () => {
      expect(component.errorMessage()).toBe('');
    });

    it('should have redirectLink default to empty string', () => {
      expect(component.redirectLink()).toBe('');
    });

    it('hasError should return false when errorMessage is empty', () => {
      expect(component.hasError()).toBe(false);
    });

    it('hasError should return true when errorMessage has a value', () => {
      component.errorMessage.set('some error');
      expect(component.hasError()).toBe(true);
    });
  });
});
