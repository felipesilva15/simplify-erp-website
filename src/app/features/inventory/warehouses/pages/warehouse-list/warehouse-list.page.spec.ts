import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseListPage } from './warehouse-list.page';

describe('WarehouseListPage', () => {
  let component: WarehouseListPage;
  let fixture: ComponentFixture<WarehouseListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
