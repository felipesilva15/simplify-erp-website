import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorLayout } from './error.layout';
import { By } from '@angular/platform-browser';

describe('ErrorLayout', () => {
  let component: ErrorLayout;
  let fixture: ComponentFixture<ErrorLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the child components', () => {
    const errorFooterBarComponentElement = fixture.debugElement.query(By.css('app-error-footer-bar'));
    const routerOutletElement = fixture.debugElement.query(By.css('router-outlet'));

    expect(errorFooterBarComponentElement).toBeTruthy();
    expect(routerOutletElement).toBeTruthy();
  });
});
