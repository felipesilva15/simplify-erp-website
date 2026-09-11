import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerTypeLookupComponent } from './partner-type-lookup.component';

describe('PartnerTypeLookupComponent', () => {
  let component: PartnerTypeLookupComponent;
  let fixture: ComponentFixture<PartnerTypeLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerTypeLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerTypeLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
