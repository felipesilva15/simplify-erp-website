import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PermissionService } from '../../../../../core/auth/services/permission-service';

import { RoleDefinePermissionsPage } from './role-define-permissions.page';

describe('RoleDefinePermissionsPage', () => {
  let component: RoleDefinePermissionsPage;
  let fixture: ComponentFixture<RoleDefinePermissionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleDefinePermissionsPage],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        { provide: PermissionService, useValue: { has: () => true, hasAny: () => true } }
      ]
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
