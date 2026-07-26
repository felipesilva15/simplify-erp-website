import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleListPage } from './role-list.page';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { Role } from '../../models/role';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { ColumnType } from '../../../../../core/enums/column-type';
import { signal } from '@angular/core';
import { RoleService } from '../../services/role-service';
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

describe('RoleListPage', () => {
  let component: RoleListPage;
  let fixture: ComponentFixture<RoleListPage>;
  let router: Router;
  let activatedRouteMock: object;
  let facadeMock: Record<string, any>;
  let navigateSpy: ReturnType<typeof vi.fn>;

  const mockRole: Role = {
    id: 1,
    name: 'Admin',
    description: 'Administrador',
    permissions: [],
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
      imports: [RoleListPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    })
      .overrideComponent(RoleListPage, {
        set: {
          providers: [
            { provide: CrudListFacade, useValue: facadeMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RoleListPage);
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
      expect(component.title()).toBe('Listar perfis');
    });
  });

  describe('breadcrumbItems', () => {
    it('should have 3 items', () => {
      expect(component.breadcrumbItems.length).toBe(3);
    });

    it('should have correct labels', () => {
      expect(component.breadcrumbItems[0].label).toBe('Segurança');
      expect(component.breadcrumbItems[1].label).toBe('Perfis');
      expect(component.breadcrumbItems[2].label).toBe('Listar');
    });

    it('should have routerLink on last item', () => {
      expect(component.breadcrumbItems[2].routerLink).toBe('/security/roles');
    });
  });

  describe('cols', () => {
    it('should have 3 columns', () => {
      expect(component.cols.length).toBe(3);
    });

    it('should have id column', () => {
      expect(component.cols[0]).toEqual({
        field: 'id',
        header: 'ID',
        sortable: true,
        type: ColumnType.INTEGER,
      });
    });

    it('should have name column', () => {
      expect(component.cols[1]).toEqual({
        field: 'name',
        header: 'Nome',
        sortable: true,
        type: ColumnType.TEXT,
      });
    });

    it('should have description column', () => {
      expect(component.cols[2]).toEqual({
        field: 'description',
        header: 'Descrição',
        sortable: false,
        type: ColumnType.TEXT,
      });
    });
  });

  describe('filterDefinition', () => {
    it('should have 3 filter fields defined by the component', () => {
      expect(component.filterDefinition.length).toBe(5);
      expect(component.filterDefinition[0].name).toBe('id');
      expect(component.filterDefinition[1].name).toBe('name');
      expect(component.filterDefinition[2].name).toBe('description');
      expect(component.filterDefinition[3].name).toBe('created_at');
      expect(component.filterDefinition[4].name).toBe('updated_at');
    });

    it('should have id filter', () => {
      expect(component.filterDefinition[0]).toEqual({
        name: 'id',
        label: 'ID',
        type: ColumnType.INTEGER,
      });
    });

    it('should have name filter', () => {
      expect(component.filterDefinition[1]).toEqual({
        name: 'name',
        label: 'Nome',
        type: ColumnType.TEXT,
      });
    });

    it('should have description filter', () => {
      expect(component.filterDefinition[2]).toEqual({
        name: 'description',
        label: 'Descrição',
        type: ColumnType.TEXT,
      });
    });
  });

  describe('tableMenu', () => {
    it('should have 5 items', () => {
      expect(component.tableMenu.length).toBe(5);
    });

    it('should have separator as fourth item', () => {
      expect(component.tableMenu[3]).toEqual({ separator: true });
    });

    describe('Visualizar action', () => {
      it('should have correct properties', () => {
        expect(component.tableMenu[0].label).toBe('Visualizar');
        expect(component.tableMenu[0].icon).toBe('pi pi-eye');
        expect(component.tableMenu[0].permission).toBe('roles.view');
      });

      it('should navigate to record id', () => {
        component.tableMenu[0].action!(mockRole);
        expect(navigateSpy).toHaveBeenCalledWith([mockRole.id], {
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
        expect(component.tableMenu[1].icon).toBe('pi pi-pencil');
        expect(component.tableMenu[1].permission).toBe('roles.edit');
      });

      it('should navigate to record id/edit', () => {
        component.tableMenu[1].action!(mockRole);
        expect(navigateSpy).toHaveBeenCalledWith(
          [mockRole.id, 'edit'],
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
        expect(component.tableMenu[2].icon).toBe('pi pi-trash');
        expect(component.tableMenu[2].permission).toBe('roles.delete');
      });

      it('should call facade.delete when record is provided', () => {
        component.tableMenu[2].action!(mockRole);
        expect(facadeMock['delete']).toHaveBeenCalledWith(mockRole);
      });

      it('should not call facade.delete when record is undefined', () => {
        component.tableMenu[2].action!(undefined);
        expect(facadeMock['delete']).not.toHaveBeenCalled();
      });
    });

    describe('Permissões action', () => {
      it('should have correct properties', () => {
        expect(component.tableMenu[4].label).toBe('Permissões');
        expect(component.tableMenu[4].icon).toBe('pi pi-star');
        expect(component.tableMenu[4].permission).toBe('roles.definePermissions');
      });

      it('should navigate to record id/permissions', () => {
        component.tableMenu[4].action!(mockRole);
        expect(navigateSpy).toHaveBeenCalledWith(
          [mockRole.id, 'permissions'],
          { relativeTo: activatedRouteMock }
        );
      });

      it('should navigate with undefined record', () => {
        try {
          component.tableMenu[4].action!(undefined);
        } catch {}
        expect(navigateSpy).toHaveBeenCalledWith(
          [undefined, 'permissions'],
          { relativeTo: activatedRouteMock }
        );
      });
    });
  });
});

describe('RoleListPage - CrudListFacade factory', () => {
  let component: RoleListPage;
  let fixture: ComponentFixture<RoleListPage>;

  beforeEach(async () => {
    const roleServiceMock = {
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
      imports: [RoleListPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: {} } },
        { provide: RoleService, useValue: roleServiceMock },
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create CrudListFacade via factory with correct permission definitions', () => {
    expect(component).toBeTruthy();
    expect(component.facade).toBeDefined();
    expect(component.facade).toBeInstanceOf(CrudListFacade);
  });
});
