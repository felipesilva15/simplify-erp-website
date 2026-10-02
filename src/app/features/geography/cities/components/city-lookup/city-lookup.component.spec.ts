import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityLookupComponent } from './city-lookup.component';

describe('CityLookupComponent', () => {
  let component: CityLookupComponent;
  let fixture: ComponentFixture<CityLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CityLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
