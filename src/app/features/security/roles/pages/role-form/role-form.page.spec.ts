import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleFormPage } from './role-form.page';

describe('RoleFormPage', () => {
  let component: RoleFormPage;
  let fixture: ComponentFixture<RoleFormPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFormPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleFormPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
