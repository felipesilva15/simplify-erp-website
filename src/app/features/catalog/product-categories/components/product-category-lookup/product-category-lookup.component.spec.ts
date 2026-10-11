import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCategoryLookupComponent } from './product-category-lookup.component';

describe('ProductCategoryLookupComponent', () => {
  let component: ProductCategoryLookupComponent;
  let fixture: ComponentFixture<ProductCategoryLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCategoryLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCategoryLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
