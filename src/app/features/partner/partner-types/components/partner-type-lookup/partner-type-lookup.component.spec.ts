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
