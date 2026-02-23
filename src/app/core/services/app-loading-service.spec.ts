import { TestBed } from '@angular/core/testing';

import { AppLoadingService } from './app-loading-service';

describe('AppLoadingService', () => {
  let service: AppLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
