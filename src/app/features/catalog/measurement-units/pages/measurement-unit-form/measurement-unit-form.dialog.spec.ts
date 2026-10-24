import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementUnitFormDialog } from './measurement-unit-form.dialog';

describe('MeasurementUnitFormDialog', () => {
  let component: MeasurementUnitFormDialog;
  let fixture: ComponentFixture<MeasurementUnitFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementUnitFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementUnitFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
