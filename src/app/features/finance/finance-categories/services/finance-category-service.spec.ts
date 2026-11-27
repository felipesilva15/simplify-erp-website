import { TestBed } from '@angular/core/testing';

import { FinanceCategoryService } from './finance-category-service';

describe('FinanceCategoryService', () => {
  let service: FinanceCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinanceCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
