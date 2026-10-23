import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBrandFormDialog } from './product-brand-form.dialog';

describe('ProductBrandFormDialog', () => {
  let component: ProductBrandFormDialog;
  let fixture: ComponentFixture<ProductBrandFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBrandFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBrandFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
