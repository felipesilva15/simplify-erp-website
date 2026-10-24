import { TestBed } from '@angular/core/testing';

import { MeasurementUnitService } from './measurement-unit-service';

describe('MeasurementUnitService', () => {
  let service: MeasurementUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasurementUnitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
