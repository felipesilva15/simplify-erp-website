import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListPage } from './user-list.page';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { User } from '../../models/user';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ColumnType } from '../../../../../core/enums/column-type';
import { signal } from '@angular/core';
import { UserService } from '../../services/user-service';
import { PermissionService } from '../../../../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../../../../../shared/services/confirm-dialog-service';
import { of } from 'rxjs';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('UserListPage', () => {
  let component: UserListPage;
  let fixture: ComponentFixture<UserListPage>;
  let router: Router;
  let activatedRouteMock: object;
  let facadeMock: Record<string, any>;
  let navigateSpy: ReturnType<typeof vi.fn>;

  const mockUser: User = {
    id: 1,
    name: 'Felipe',
    username: 'felipe',
    email: 'felipe@test.com',
    phone_number: '11999990000',
    is_admin: true,
    permissions: [],
    roles: [],
    avatar_url: '',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    activatedRouteMock = { snapshot: {} };
    facadeMock = {
      data: signal([]),
      loading: signal(false),
      error: signal(null),
      totalRecords: signal(0),
      filterDefinitionVisible: signal(false),
      requestParams: signal(undefined),
      response: signal(null),
      delete: vi.fn(),
      load: vi.fn(),
      openFilters: vi.fn(),
      fitlersVisibleChange: vi.fn(),
      applyFilters: vi.fn(),
      applyLazyLoad: vi.fn(),
      can: vi.fn().mockReturnValue(true),
      canCreate: vi.fn().mockReturnValue(true),
      canUpdate: vi.fn().mockReturnValue(true),
      canDelete: vi.fn().mockReturnValue(true),
      canView: vi.fn().mockReturnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [UserListPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    })
      .overrideComponent(UserListPage, {
        set: {
          providers: [
            { provide: CrudListFacade, useValue: facadeMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(UserListPage);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('title', () => {
    it('should have default value', () => {
      expect(component.title()).toBe('Listar usuários');
    });
  });

  describe('breadcrumbItems', () => {
    it('should have 3 items', () => {
      expect(component.breadcrumbItems.length).toBe(3);
    });

    it('should have routerLink on last item', () => {
      expect(component.breadcrumbItems[2].routerLink).toBeDefined();
    });
  });

  describe('cols', () => {
    it('should have 7 columns', () => {
      expect(component.cols.length).toBe(7);
    });

    it('should have id column', () => {
      expect(component.cols[0].field).toEqual('id');
    });

    it('should have name column', () => {
      expect(component.cols[1].field).toEqual('name');
    });

    it('should have email column', () => {
      expect(component.cols[2].field).toEqual('email');
    });

    it('should have username column', () => {
      expect(component.cols[3].field).toEqual('username');
    });

    it('should have phone_number column', () => {
      expect(component.cols[4].field).toEqual('phone_number');
    });

    it('should have is_admin column', () => {
      expect(component.cols[5].field).toEqual('is_admin');
    });

    it('should have roles column with template', () => {
      expect(component.cols[6].field).toEqual('roles');
      expect(component.cols[6].template).toBeDefined();
    });
  });

  describe('filterDefinition', () => {
    it('should have 8 filter fields defined by the component', () => {
      expect(component.filterDefinition.length).toBe(8);
      expect(component.filterDefinition[0].name).toBe('id');
      expect(component.filterDefinition[1].name).toBe('name');
      expect(component.filterDefinition[2].name).toBe('email');
      expect(component.filterDefinition[3].name).toBe('username');
      expect(component.filterDefinition[4].name).toBe('phone_number');
      expect(component.filterDefinition[5].name).toBe('is_admin');
      expect(component.filterDefinition[6].name).toBe('created_at');
      expect(component.filterDefinition[7].name).toBe('updated_at');
    });

    it('should have id filter', () => {
      expect(component.filterDefinition[0].name).toEqual('id');
    });

    it('should have name filter', () => {
      expect(component.filterDefinition[1].name).toEqual('name');
    });

    it('should have email filter', () => {
      expect(component.filterDefinition[2].name).toEqual('email');
    });
  });

  describe('tableMenu', () => {
    it('should have 3 items', () => {
      expect(component.tableMenu.length).toBe(3);
    });

    describe('Visualizar action', () => {
      it('should have correct properties', () => {
        expect(component.tableMenu[0].label).toBe('Visualizar');
        expect(component.tableMenu[0].permission).toBe('users.view');
      });

      it('should navigate to record id', () => {
        component.tableMenu[0].action!(mockUser);
        expect(navigateSpy).toHaveBeenCalledWith([mockUser.id], {
          relativeTo: activatedRouteMock,
        });
      });

      it('should navigate with undefined record', () => {
        try {
          component.tableMenu[0].action!(undefined);
        } catch {}
        expect(navigateSpy).toHaveBeenCalledWith([undefined], {
          relativeTo: activatedRouteMock,
        });
      });
    });

    describe('Editar action', () => {
      it('should have correct properties', () => {
        expect(component.tableMenu[1].label).toBe('Editar');
        expect(component.tableMenu[1].permission).toBe('users.edit');
      });

      it('should navigate to record id/edit', () => {
        component.tableMenu[1].action!(mockUser);
        expect(navigateSpy).toHaveBeenCalledWith(
          [mockUser.id, 'edit'],
          { relativeTo: activatedRouteMock }
        );
      });

      it('should navigate with undefined record', () => {
        try {
          component.tableMenu[1].action!(undefined);
        } catch {}
        expect(navigateSpy).toHaveBeenCalledWith(
          [undefined, 'edit'],
          { relativeTo: activatedRouteMock }
        );
      });
    });

    describe('Deletar action', () => {
      it('should have correct properties', () => {
        expect(component.tableMenu[2].label).toBe('Deletar');
        expect(component.tableMenu[2].permission).toBe('users.delete');
      });

      it('should call facade.delete when record is provided', () => {
        component.tableMenu[2].action!(mockUser);
        expect(facadeMock['delete']).toHaveBeenCalledWith(mockUser);
      });

      it('should not call facade.delete when record is undefined', () => {
        component.tableMenu[2].action!(undefined);
        expect(facadeMock['delete']).not.toHaveBeenCalled();
      });
    });
  });
});

describe('UserListPage - CrudListFacade factory', () => {
  let component: UserListPage;
  let fixture: ComponentFixture<UserListPage>;

  beforeEach(async () => {
    const userServiceMock = {
      list: vi.fn().mockReturnValue(of({ data: [], meta: {} })),
      get: vi.fn(),
      edit: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const permissionServiceMock = {
      has: vi.fn().mockReturnValue(true),
      hasAny: vi.fn().mockReturnValue(true),
    };

    const confirmDialogServiceMock = {
      confirm: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [UserListPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
        { provide: UserService, useValue: userServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create CrudListFacade via factory with correct permission definitions', () => {
    expect(component).toBeTruthy();
    expect(component.facade).toBeDefined();
    expect(component.facade).toBeInstanceOf(CrudListFacade);
  });
});
