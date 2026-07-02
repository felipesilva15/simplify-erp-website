import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { appStartupGuard } from './app-startup-guard';
import { Mocked } from 'vitest';
import { AppStartupService } from '../services/app-startup-service';

describe('appStartupGuard', () => {
  let appStartupService: Mocked<AppStartupService>;

  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => appStartupGuard(...guardParameters));

  beforeEach(() => {
    appStartupService = {
      init: vi.fn().mockResolvedValue(undefined)
    } as unknown as Mocked<AppStartupService>

    TestBed.configureTestingModule({
      providers: [
        { provide: AppStartupService, useValue: appStartupService },
      ]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should call init from appStartupService', async () => {
    const result = await executeGuard({} as any, {} as any);

    expect(appStartupService.init).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
