import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { errorResponseInterceptor } from './error-response-interceptor';
import { AppLoadingService } from './../services/app-loading-service';
import { ToastService } from '../../shared/services/toast-service';
import { AuthService } from '../auth/services/auth-service';

describe('errorResponseInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  let routerSpy: { navigate: any };
  let appLoadingServiceSpy: { stop: any };
  let toastServiceSpy: { show: any };
  let authServiceMock: { user: any };

  beforeEach(() => {
    routerSpy = {
      navigate: vi.fn()
    };
    appLoadingServiceSpy = {
      stop: vi.fn()
    };
    toastServiceSpy = {
      show: vi.fn()
    };
    authServiceMock = {
      user: null
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorResponseInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: AppLoadingService, useValue: appLoadingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const interceptor: HttpInterceptorFn = (req, next) =>
      TestBed.runInInjectionContext(() => errorResponseInterceptor(req, next));
    expect(interceptor).toBeTruthy();
  });

  it('should pass through successful requests', () => {
    httpClient.get('/api/test').subscribe(response => {
      expect(response).toEqual({ data: 'ok' });
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ data: 'ok' });

    expect(appLoadingServiceSpy.stop).not.toHaveBeenCalled();
    expect(toastServiceSpy.show).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should handle 401 error and redirect to login when URL does not contain /security/auth/login', () => {
    httpClient.get('/api/resource').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/api/resource');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(toastServiceSpy.show).toHaveBeenCalledWith({
      severity: 'error',
      title: 'Ops...',
      message: 'Você precisa fazer login para acessar este recurso!',
      life: 7000
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/security/auth/login']);
    expect(appLoadingServiceSpy.stop).toHaveBeenCalled();
  });

  it('should handle 401 error and NOT redirect or show toast when URL contains /security/auth/login', () => {
    httpClient.get('/security/auth/login').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/security/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(toastServiceSpy.show).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(appLoadingServiceSpy.stop).toHaveBeenCalled();
  });

  it('should handle 403 error, redirect to /error/403 with user username when user is logged in', () => {
    authServiceMock.user = { username: 'felipe' };

    httpClient.get('/api/forbidden').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(403);
      }
    });

    const req = httpMock.expectOne('/api/forbidden');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error/403'], {
      state: { username: 'felipe' }
    });
    expect(appLoadingServiceSpy.stop).toHaveBeenCalled();
  });

  it('should handle 403 error, redirect to /error/403 with empty username when user is not logged in', () => {
    authServiceMock.user = null;

    httpClient.get('/api/forbidden').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(403);
      }
    });

    const req = httpMock.expectOne('/api/forbidden');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error/403'], {
      state: { username: '' }
    });
    expect(appLoadingServiceSpy.stop).toHaveBeenCalled();
  });

  it('should handle 404 error, redirect to /error/404 with user username when user is logged in', () => {
    authServiceMock.user = { username: 'felipe' };

    httpClient.get('/api/notfound').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(404);
      }
    });

    const req = httpMock.expectOne('/api/notfound');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error/404'], {
      state: { username: 'felipe' }
    });
    expect(appLoadingServiceSpy.stop).toHaveBeenCalled();
  });

  it('should handle 404 error, redirect to /error/404 with empty username when user is not logged in', () => {
    authServiceMock.user = null;

    httpClient.get('/api/notfound').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(404);
      }
    });

    const req = httpMock.expectOne('/api/notfound');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error/404'], {
      state: { username: '' }
    });
    expect(appLoadingServiceSpy.stop).toHaveBeenCalled();
  });

  it('should handle other errors (e.g. 500) and stop loading, but not redirect or toast', () => {
    httpClient.get('/api/servererror').subscribe({
      next: () => expect.fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/servererror');
    req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(toastServiceSpy.show).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(appLoadingServiceSpy.stop).toHaveBeenCalled();
  });
});
