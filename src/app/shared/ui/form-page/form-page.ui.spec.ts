import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPageUi } from './form-page.ui';

describe('FormPageUi', () => {
  let component: FormPageUi;
  let fixture: ComponentFixture<FormPageUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPageUi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormPageUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
