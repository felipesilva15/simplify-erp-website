import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseLookupComponent } from './warehouse-lookup.component';

describe('WarehouseLookupComponent', () => {
  let component: WarehouseLookupComponent;
  let fixture: ComponentFixture<WarehouseLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
