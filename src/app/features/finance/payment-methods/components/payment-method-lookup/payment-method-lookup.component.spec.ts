import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodLookupComponent } from './payment-method-lookup.component';

describe('PaymentMethodLookupComponent', () => {
  let component: PaymentMethodLookupComponent;
  let fixture: ComponentFixture<PaymentMethodLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodLookupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodLookupComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
