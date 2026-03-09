import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDefinerComponent } from './filter-definer.component';

describe('FilterDefinerComponent', () => {
  let component: FilterDefinerComponent<any>;
  let fixture: ComponentFixture<FilterDefinerComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterDefinerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterDefinerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
