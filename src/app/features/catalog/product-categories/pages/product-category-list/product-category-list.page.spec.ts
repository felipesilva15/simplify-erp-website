import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ProductCategoryListPage } from './product-category-list.page';

describe('ProductCategoryListPage', () => {
  let component: ProductCategoryListPage;
  let fixture: ComponentFixture<ProductCategoryListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCategoryListPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
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
