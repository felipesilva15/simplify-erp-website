import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateLookupComponent } from './state-lookup.component';

describe('StateLookupComponent', () => {
  let component: StateLookupComponent;
  let fixture: ComponentFixture<StateLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
