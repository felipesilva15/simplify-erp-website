import { TestBed } from '@angular/core/testing';

import { DynamicDrawerService } from './dynamic-drawer-service';

describe('DynamicDrawerService', () => {
  let service: DynamicDrawerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicDrawerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
