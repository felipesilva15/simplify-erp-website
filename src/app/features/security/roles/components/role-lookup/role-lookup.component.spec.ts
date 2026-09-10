import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleLookupComponent } from './role-lookup.component';

describe('RoleLookupComponent', () => {
  let component: RoleLookupComponent;
  let fixture: ComponentFixture<RoleLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
