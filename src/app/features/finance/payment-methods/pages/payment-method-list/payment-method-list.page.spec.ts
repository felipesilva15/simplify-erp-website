import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodListPage } from './payment-method-list.page';

describe('PaymentMethodListPage', () => {
  let component: PaymentMethodListPage;
  let fixture: ComponentFixture<PaymentMethodListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
