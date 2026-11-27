import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceCategoryFormDialog } from './finance-category-form.dialog';

describe('FinanceCategoryFormDialog', () => {
  let component: FinanceCategoryFormDialog;
  let fixture: ComponentFixture<FinanceCategoryFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceCategoryFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinanceCategoryFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
