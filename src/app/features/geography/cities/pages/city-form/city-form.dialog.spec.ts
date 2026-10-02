import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityFormDialog } from './city-form.dialog';

describe('CityFormDialog', () => {
  let component: CityFormDialog;
  let fixture: ComponentFixture<CityFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
