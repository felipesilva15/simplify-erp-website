import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryFormDialog } from './country-form.dialog';

describe('CountryFormDialog', () => {
  let component: CountryFormDialog;
  let fixture: ComponentFixture<CountryFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
