import { TestBed } from '@angular/core/testing';

import { PermissionService } from './permission-service';
import { AuthService } from './auth-service';

describe('PermissionService', () => {
  let service: PermissionService;
  let authService: { 
    user: { 
      permissions: string[] | null 
    } 
  };

  beforeEach(() => {
    authService = {
      user: {
        permissions: [],
      }
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    });
    service = TestBed.inject(PermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when the permissions is null', () => {
    authService.user.permissions = null;
    expect(service.has('test.list')).toBe(false);
  });

  it('should return true when the user has the required permission', () => {
    authService.user.permissions = ['test.list'];
    expect(service.has('test.list')).toBe(true);
  });

  it('should return false when the user does not have the required permission', () => {
    authService.user.permissions = ['test.list'];
    expect(service.has('test.delete')).toBe(false);
  });

  it('should return true when the user has all permissions', () => {
    authService.user.permissions = ['*'];
    expect(service.has('test.list')).toBe(true);
  });

  it('should return true when the user has one of the required permissions', () => {
    authService.user.permissions = ['test.list', 'test.create'];
    expect(service.has('test.list')).toBe(true);
  });

  it('should return false when the user does not have any of the required permissions', () => {
    authService.user.permissions = ['test.list', 'test.create'];
    expect(service.has('test.delete')).toBe(false);
  });

  it('should return true when the user has all of the required permissions', () => {
    authService.user.permissions = ['*'];
    expect(service.has('test.delete')).toBe(true);
  });
});
