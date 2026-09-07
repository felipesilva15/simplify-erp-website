import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartnerTypeFormDialog } from './partner-type-form.dialog';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { PartnerTypeService } from '../../services/partner-type-service';
import { PermissionService } from '../../../../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../../../../../shared/services/confirm-dialog-service';
import { ToastService } from '../../../../../shared/services/toast-service';
import { Location } from '@angular/common';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DynamicDialogService } from '../../../../../shared/services/dynamic-dialog-service';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { FormMode } from '../../../../../core/enums/form-mode';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('PartnerTypeFormDialog', () => {
  let component: PartnerTypeFormDialog;
  let fixture: ComponentFixture<PartnerTypeFormDialog>;

  let activatedRouteMock: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } };
  let routeUtilsMock: { getFormModeFromCurrentUrl: ReturnType<typeof vi.fn> };
  let configMock: { data: Record<string, unknown> };
  let facadeMock: {
    init: ReturnType<typeof vi.fn>;
    submit: ReturnType<typeof vi.fn>;
    navigateBack: ReturnType<typeof vi.fn>;
    loading: ReturnType<typeof vi.fn>;
    saving: ReturnType<typeof vi.fn>;
    hasWarnings: ReturnType<typeof vi.fn>;
    hasServerErrors: ReturnType<typeof vi.fn>;
    warnings: ReturnType<typeof vi.fn>;
    serverErrors: ReturnType<typeof vi.fn>;
    entity: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue(null),
        },
      },
    };

    routeUtilsMock = { getFormModeFromCurrentUrl: vi.fn().mockReturnValue(FormMode.Create) };

    configMock = { data: {} };

    facadeMock = {
      init: vi.fn().mockResolvedValue(undefined),
      submit: vi.fn().mockReturnValue(of({ success: true, message: '', data: {} })),
      navigateBack: vi.fn(),
      loading: vi.fn().mockReturnValue(false),
      saving: vi.fn().mockReturnValue(false),
      hasWarnings: vi.fn().mockReturnValue(false),
      hasServerErrors: vi.fn().mockReturnValue(false),
      warnings: vi.fn().mockReturnValue([]),
      serverErrors: vi.fn().mockReturnValue([]),
      entity: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [PartnerTypeFormDialog],
      providers: [
        provideRouter([{ path: '**', component: PartnerTypeFormDialog }]),
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: RouteUtilsService, useValue: routeUtilsMock },
        { provide: DynamicDialogConfig, useValue: configMock },
        { provide: DynamicDialogService, useValue: { close: vi.fn() } },
        { provide: GenericCrudFormFacade, useValue: facadeMock },
      ],
    })
      .overrideComponent(PartnerTypeFormDialog, {
        remove: {
          providers: [{ provide: GenericCrudFormFacade }],
        },
        add: {
          providers: [{ provide: GenericCrudFormFacade, useValue: facadeMock }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PartnerTypeFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set mode from routeUtilsService', () => {
    expect(component.mode()).toBe(FormMode.Create);
  });

  it('should set id to 0 when no id is provided', () => {
    expect(component.id()).toBe(0);
  });

  it('should use dialogConfig.data.id when the route has no id param (overlay ActivatedRoute)', () => {
    configMock.data = { id: '42' };
    fixture = TestBed.createComponent(PartnerTypeFormDialog);
    component = fixture.componentInstance;
    expect(component.id()).toBe(42);
  });

  it('should prefer the route param when it is present', () => {
    (activatedRouteMock.snapshot.paramMap.get as ReturnType<typeof vi.fn>).mockReturnValue('7');
    fixture = TestBed.createComponent(PartnerTypeFormDialog);
    component = fixture.componentInstance;
    expect(component.id()).toBe(7);
  });

  it('should call facade.init with mode, form and id', () => {
    expect(facadeMock.init).toHaveBeenCalledWith(FormMode.Create, component.form, 0);
  });

  it('should call facade.submit on submit', () => {
    component.onSubmit();
    expect(facadeMock.submit).toHaveBeenCalledWith(component.form, 0);
  });

  it('should notify DialogRefreshService when save succeeds', () => {
    const refreshService = TestBed.inject(DialogRefreshService);
    const spy = vi.spyOn(refreshService, 'notifySaved');

    component.onSubmit();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
