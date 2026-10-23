import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBrandListPage } from './product-brand-list.page';

describe('ProductBrandListPage', () => {
  let component: ProductBrandListPage;
  let fixture: ComponentFixture<ProductBrandListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBrandListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductBrandListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
