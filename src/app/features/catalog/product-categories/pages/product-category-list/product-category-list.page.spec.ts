import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCategoryListPage } from './product-category-list.page';

describe('ProductCategoryListPage', () => {
  let component: ProductCategoryListPage;
  let fixture: ComponentFixture<ProductCategoryListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCategoryListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCategoryListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
