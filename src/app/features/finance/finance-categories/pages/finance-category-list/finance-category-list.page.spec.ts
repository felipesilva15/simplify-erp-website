import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceCategoryListPage } from './finance-category-list.page';

describe('FinanceCategoryListPage', () => {
  let component: FinanceCategoryListPage;
  let fixture: ComponentFixture<FinanceCategoryListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceCategoryListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceCategoryListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
