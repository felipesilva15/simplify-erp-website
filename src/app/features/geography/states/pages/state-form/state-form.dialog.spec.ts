import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StateFormDialog } from './state-form.dialog';

describe('StateFormDialog', () => {
  let component: StateFormDialog;
  let fixture: ComponentFixture<StateFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StateFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StateFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
