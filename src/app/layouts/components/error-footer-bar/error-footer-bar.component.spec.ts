import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorFooterBarComponent } from './error-footer-bar.component';

describe('ErrorFooterBarComponent', () => {
  let component: ErrorFooterBarComponent;
  let fixture: ComponentFixture<ErrorFooterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorFooterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorFooterBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
