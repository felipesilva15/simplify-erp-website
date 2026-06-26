import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorLayout } from './error.layout';

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
});
