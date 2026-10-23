import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBrandLookupComponent } from './product-brand-lookup.component';

describe('ProductBrandLookupComponent', () => {
  let component: ProductBrandLookupComponent;
  let fixture: ComponentFixture<ProductBrandLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBrandLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBrandLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
