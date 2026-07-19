import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../../../environments/environment';
import { User } from '../../../features/security/users/models/user';
import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };

  const baseUrl = `${environment.baseUrlApi}/security/auth`;
  const now = new Date('2026-01-01T00:00:00.000Z');
  const user: User = {
    id: 1,
    name: 'Jane Doe',
    username: 'jane.doe',
    email: 'jane@example.com',
    phone_number: '+5511999999999',
    is_admin: false,
    permissions: ['users.view'],
    roles: [],
    avatar_url: 'https://example.com/avatar.png',
    created_at: now,
    updated_at: now,
  };

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should POST to /login with credentials', () => {
      const payload = { username: 'jane.doe', password: 'secret' };
      const response = { access_token: 'abc', token_type: 'Bearer', expires_in: 3600 };

      service.login(payload).subscribe(result => {
        expect(result).toEqual(response);
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.body).toEqual(payload);

      req.flush(response);
    });
  });

  describe('loadUser', () => {
    it('should GET /me and set user on success', async () => {
      const promise = service.loadUser();

      const req = httpMock.expectOne(`${baseUrl}/me`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);

      req.flush(user);
      await promise;

      expect(service.user).toEqual(user);
    });

    it('should resolve and set user to null on error', async () => {
      const promise = service.loadUser();

      const req = httpMock.expectOne(`${baseUrl}/me`);
      expect(req.request.method).toBe('GET');

      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      await promise;

      expect(service.user).toBeNull();
    });
  });

  describe('user', () => {
    it('should return null by default', () => {
      expect(service.user).toBeNull();
    });

    it('should reflect the current userSubject value after loadUser', async () => {
      const promise = service.loadUser();

      const req = httpMock.expectOne(`${baseUrl}/me`);
      req.flush(user);
      await promise;

      expect(service.user).toEqual(user);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is loaded', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true after a user is loaded', async () => {
      const promise = service.loadUser();

      const req = httpMock.expectOne(`${baseUrl}/me`);
      req.flush(user);
      await promise;

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false after loadUser fails', async () => {
      const promise = service.loadUser();

      const req = httpMock.expectOne(`${baseUrl}/me`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      await promise;

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('user$', () => {
    it('should emit null by default', () => {
      let currentUser: User | null = null;
      service.user$.subscribe(u => currentUser = u);
      expect(currentUser).toBeNull();
    });

    it('should emit user after loadUser succeeds', async () => {
      let currentUser: User | null = null;
      service.user$.subscribe(u => currentUser = u);

      const promise = service.loadUser();
      const req = httpMock.expectOne(`${baseUrl}/me`);
      req.flush(user);
      await promise;

      expect(currentUser).toEqual(user);
    });
  });

  describe('logout', () => {
    it('should POST to /logout with credentials and navigate', async () => {
      service.logout().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.body).toBeNull();

      req.flush(null);

      await new Promise(resolve => setTimeout(resolve));

      expect(router.navigate).toHaveBeenCalledWith(['/security/auth/login']);
    });

    it('should navigate even when the logout request fails', async () => {
      service.logout().subscribe({ error: () => {} });

      const req = httpMock.expectOne(`${baseUrl}/logout`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      await new Promise(resolve => setTimeout(resolve));

      expect(router.navigate).toHaveBeenCalledWith(['/security/auth/login']);
    });
  });
});
