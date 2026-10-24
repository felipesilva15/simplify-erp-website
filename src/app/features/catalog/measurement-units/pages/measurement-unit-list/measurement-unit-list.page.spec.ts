import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementUnitListPage } from './measurement-unit-list.page';

describe('MeasurementUnitListPage', () => {
  let component: MeasurementUnitListPage;
  let fixture: ComponentFixture<MeasurementUnitListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementUnitListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementUnitListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
