import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';

import { permissionGuard } from './permission-guard';
import { Mocked } from 'vitest';
import { AuthService } from '../auth/services/auth-service';
import { AppStartupService } from '../services/app-startup-service';
import { PermissionService } from '../auth/services/permission-service';
import { Observable, of } from 'rxjs';

describe('permissionGuard', () => {
  let permissionService: { has: ReturnType<typeof vi.fn> }
  let authService: { user: { username: string } };
  let appStartupService: Mocked<AppStartupService>;
  let router: { navigate: ReturnType<typeof vi.fn>, url: string }

  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => permissionGuard(...guardParameters));

  beforeEach(() => {
    permissionService = {
      has: vi.fn()
    }
    authService = {
      user: {
        username: 'test'
      }
    }
    appStartupService = {
      initalized$: of(true)
    } as unknown as Mocked<AppStartupService>
    router = {
      navigate: vi.fn(),
      url: '/'
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: PermissionService, useValue: permissionService },
        { provide: AuthService, useValue: authService },
        { provide: AppStartupService, useValue: appStartupService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true when permission is empty', async () => {
    const result = await executeGuard({} as any, {} as any);

    expect(permissionService.has).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return true when has permitted', async () => {
    permissionService.has.mockReturnValue(true);

    const result = await executeGuard({ data: { permission: 'guard.test' } } as any, {} as any);

    expect(permissionService.has).toHaveBeenCalledWith('guard.test');
    expect(result).toBe(true);
  });

  it('should return false when permission is denied and navigate to the error page', async () => {
    permissionService.has.mockReturnValue(false);
    router.url = '/guard'

    const result = await executeGuard({ data: { permission: 'guard.test' } } as any, {} as any);

    expect(permissionService.has).toHaveBeenCalledWith('guard.test');
    expect(router.navigate).toHaveBeenCalledWith(['/error/403'], { state: { username: 'test' } });
    expect(result).toBe(false);
  });

  it('should return false when permission is denied and not navigate to the error page when already on it', async () => {
    permissionService.has.mockReturnValue(false);
    router.url = '/error/404'

    const result = await executeGuard({ data: { permission: 'guard.test' } } as any, {} as any);

    expect(permissionService.has).toHaveBeenCalledWith('guard.test');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
