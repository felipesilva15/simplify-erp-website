import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionFormDialog } from './profession-form.dialog';

describe('ProfessionFormDialog', () => {
  let component: ProfessionFormDialog;
  let fixture: ComponentFixture<ProfessionFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
