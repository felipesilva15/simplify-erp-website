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

  describe('setDisabledState', () => {
    it('should disable the inner control when disabled', () => {
      component.setDisabledState(true);

      expect(component.innerControl.disabled).toBe(true);
    });

    it('should enable the inner control when enabled', () => {
      component.innerControl.disable();
      component.setDisabledState(false);

      expect(component.innerControl.enabled).toBe(true);
    });

    it('should re-enable an inner control that was previously disabled', () => {
      component.setDisabledState(true);
      component.setDisabledState(false);

      expect(component.innerControl.enabled).toBe(true);
    });
  });
});
