import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementUnitLookupComponent } from './measurement-unit-lookup.component';

describe('MeasurementUnitLookupComponent', () => {
  let component: MeasurementUnitLookupComponent;
  let fixture: ComponentFixture<MeasurementUnitLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementUnitLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementUnitLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
