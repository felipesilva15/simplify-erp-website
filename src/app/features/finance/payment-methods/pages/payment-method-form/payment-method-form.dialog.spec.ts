import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodFormDialog } from './payment-method-form.dialog';

describe('PaymentMethodFormDialog', () => {
  let component: PaymentMethodFormDialog;
  let fixture: ComponentFixture<PaymentMethodFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
