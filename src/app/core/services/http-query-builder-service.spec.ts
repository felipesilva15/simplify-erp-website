import { TestBed } from '@angular/core/testing';

import { HttpQueryBuilderService } from './http-query-builder-service';

describe('HttpQueryBuilderService', () => {
  let service: HttpQueryBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpQueryBuilderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
