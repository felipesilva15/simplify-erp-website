import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionLookupComponent } from './profession-lookup.component';

describe('ProfessionLookupComponent', () => {
  let component: ProfessionLookupComponent;
  let fixture: ComponentFixture<ProfessionLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
