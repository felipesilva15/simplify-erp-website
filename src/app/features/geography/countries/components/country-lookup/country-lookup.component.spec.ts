import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryLookupComponent } from './country-lookup.component';

describe('CountryLookupComponent', () => {
  let component: CountryLookupComponent;
  let fixture: ComponentFixture<CountryLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
