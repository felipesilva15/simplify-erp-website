import { TestBed } from '@angular/core/testing';

import { AppStartupService } from './app-startup-service';

describe('AppStartupService', () => {
  let service: AppStartupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppStartupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
