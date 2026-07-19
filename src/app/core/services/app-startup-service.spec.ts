import { TestBed } from '@angular/core/testing';

import { AppStartupService } from './app-startup-service';
import { AppLoadingService } from './app-loading-service';
import { ToastService } from '../../shared/services/toast-service';
import { AuthService } from '../auth/services/auth-service';
import { of } from 'rxjs';

describe('AppStartupService', () => {
  let service: AppStartupService;

  let appLoadingServiceMock: { start: any; stop: any };
  let toastServiceMock: { clear: any };
  let authServiceMock: { loadUser: any };

  beforeEach(() => {
    appLoadingServiceMock = {
      start: vi.fn(),
      stop: vi.fn()
    };
    toastServiceMock = {
      clear: vi.fn()
    };
    authServiceMock = {
      loadUser: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AppLoadingService, useValue: appLoadingServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
    service = TestBed.inject(AppStartupService);
    service.delay = 0;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('init', () => {
    it('should set the initalized$ false by default', async () => {
      let result: boolean | undefined;
      service.initalized$.subscribe(value => result = value);
      expect(result).toBe(false);
    });

    it('should set the initalized$ true after initialization', async () => {
      let result: boolean | undefined;
      service.initalized$.subscribe(value => result = value);
      expect(result).toBe(false);
      await service.init();
      expect(result).toBe(true);
    });

    it('should clear toast messages', async () => {
      await service.init();
      expect(toastServiceMock.clear).toHaveBeenCalled();
    });

    it('should start and stop app loading', async () => {
      await service.init();
      expect(appLoadingServiceMock.start).toHaveBeenCalled();
      expect(appLoadingServiceMock.stop).toHaveBeenCalled();
    });

    it('should call authService.loadUser', async () => {
      await service.init();
      expect(authServiceMock.loadUser).toHaveBeenCalled();
    });
  });
});
