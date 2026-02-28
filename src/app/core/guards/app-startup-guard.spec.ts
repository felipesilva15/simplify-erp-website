import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { appStartupGuard } from './app-startup-guard';

describe('appStartupGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => appStartupGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
