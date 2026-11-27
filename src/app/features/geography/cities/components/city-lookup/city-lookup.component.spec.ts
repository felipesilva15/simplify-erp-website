import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LookupComponent } from '../../../../../shared/components/lookup/lookup.component';
import { FilterOperator } from '../../../../../core/enums/filter-operator';
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

  it('should forward fixed filters to the underlying lookup', () => {
    const filters = { state_id: { [FilterOperator.Equal]: 35 } };
    fixture.componentRef.setInput('filters', filters);
    fixture.detectChanges();

    const innerLookup = fixture.debugElement.query(By.directive(LookupComponent))
      ?.componentInstance as LookupComponent;

    expect(innerLookup.filters).toEqual(filters);
  });
});
