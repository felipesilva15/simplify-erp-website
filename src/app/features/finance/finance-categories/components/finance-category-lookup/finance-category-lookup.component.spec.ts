import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceCategoryLookupComponent } from './finance-category-lookup.component';

describe('FinanceCategoryLookupComponent', () => {
  let component: FinanceCategoryLookupComponent;
  let fixture: ComponentFixture<FinanceCategoryLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceCategoryLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceCategoryLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
