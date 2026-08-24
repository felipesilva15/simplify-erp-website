import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleDefinePermissionsPage } from './role-define-permissions.page';

describe('RoleDefinePermissionsPage', () => {
  let component: RoleDefinePermissionsPage;
  let fixture: ComponentFixture<RoleDefinePermissionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleDefinePermissionsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleDefinePermissionsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
