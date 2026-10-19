import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { PartnerFormPage } from './partner-form.page';
import { PartnerService } from '../../services/partner-service';
import { AuthService } from '../../../../../core/auth/services/auth-service';
import { provideNgxMask } from 'ngx-mask';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { DynamicDialogService } from '../../../../../shared/services/dynamic-dialog-service';
import { ADDRESSES_LIST_CONFIG } from '../../../../geography/addresses/config/addresses-child-list.config';
import { AddressType } from '../../../../geography/addresses/enums/address-type';
import { Address } from '../../../../geography/addresses/models/address';

describe('PartnerFormPage', () => {
  let component: PartnerFormPage;
  let fixture: ComponentFixture<PartnerFormPage>;
  let mockPartnerService: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    edit: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    search: ReturnType<typeof vi.fn>;
    activityLogs: ReturnType<typeof vi.fn>;
  };

  const activatedRouteStub = {
    snapshot: {
      paramMap: {
        get: () => null,
      },
    },
  };

  beforeEach(async () => {
    mockPartnerService = {
      create: vi.fn(() => of({ success: true, message: '', data: {} })),
      update: vi.fn(() => of({ success: true, message: '', data: {} })),
      get: vi.fn(() => of({ success: true, message: '', data: {} })),
      edit: vi.fn(() => of({ success: true, message: '', data: {} })),
      list: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
      activityLogs: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PartnerFormPage],
      providers: [
        provideRouter([{ path: 'new', component: PartnerFormPage }]),
        provideNgxMask(),
        DialogService,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: AuthService, useValue: { user: { permissions: ['*'] } } },
        { provide: ConfirmationService, useValue: { confirm: vi.fn() } },
        { provide: MessageService, useValue: { add: vi.fn(), clear: vi.fn() } },
        { provide: DynamicDialogService, useValue: { open: vi.fn(() => new Promise(() => {})), close: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    await TestBed.inject(Router).navigateByUrl('/new');

    fixture = TestBed.createComponent(PartnerFormPage);
    fixture.detectChanges();
    component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  describe('submit', () => {
    it('should send the LookupItem key for partner_type_code in the payload', async () => {
      await TestBed.inject(Router).navigateByUrl('/new');

      fixture = TestBed.createComponent(PartnerFormPage);
      fixture.detectChanges();
      component = fixture.componentInstance;

      component.form.patchValue({
        name: 'John Doe',
        trade_name: 'John LTDA',
        document_number: '12345678000199',
      });

      component.form.get('partner_type_code')?.setValue({
        key: 'CODE-1',
        label: 'Distribuidor',
        meta: {},
      } as LookupItem);

      component.onSubmit();

      expect(mockPartnerService.create).toHaveBeenCalled();

      const payload = mockPartnerService.create.mock.calls[0][0];
      expect(payload.partner_type_code).toBe('CODE-1');
    });

    it('should send the addresses array in the payload', async () => {
      await TestBed.inject(Router).navigateByUrl('/new');

      fixture = TestBed.createComponent(PartnerFormPage);
      fixture.detectChanges();
      component = fixture.componentInstance;

      component.form.patchValue({
        name: 'John Doe',
        trade_name: 'John LTDA',
        document_number: '12345678000199',
        addresses: [
          {
            id: 0,
            type: 'RESIDENTIAL' as any,
            is_primary: true,
            country_id: 1,
            state_id: 35,
            city_id: 5503089,
            street: 'Avenida Paulista',
            number: '1000',
            district: 'Bela Vista',
            postal_code: '01310-100',
          },
        ],
      });
      component.form.get('partner_type_code')?.setValue({ key: 'CODE-1', label: 'Distribuidor', meta: {} } as LookupItem);

      component.onSubmit();

      expect(mockPartnerService.create).toHaveBeenCalled();

      const payload = mockPartnerService.create.mock.calls[0][0];
      expect(payload.addresses).toHaveLength(1);
      expect(payload.addresses[0]).toMatchObject({
        type: 'RESIDENTIAL',
        is_primary: true,
        country_id: 1,
        state_id: 35,
        city_id: 5503089,
        street: 'Avenida Paulista',
        postal_code: '01310-100',
      });
    });

    it('should serialize addresses edited through the child facade into the payload', async () => {
      await TestBed.inject(Router).navigateByUrl('/new');

      fixture = TestBed.createComponent(PartnerFormPage);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      component = fixture.componentInstance;

      component.form.patchValue({
        name: 'John Doe',
        trade_name: 'John LTDA',
        document_number: '12345678000199',
      });
      component.form.get('partner_type_code')?.setValue({ key: 'CODE-1', label: 'Distribuidor', meta: {} } as LookupItem);

      const item = ADDRESSES_LIST_CONFIG.hydrateItem!({
        id: 0,
        type: 'BILLING' as AddressType,
        is_primary: false,
        country_id: 1,
        country_iso_code: 'BR',
        state_id: 35,
        state_name: 'São Paulo',
        city_id: 5503089,
        city_name: 'São Paulo',
        street: 'Rua das Flores',
      } as Address);

      component.addressesFacade.add();
      component.addressesFacade.commit(item);

      component.onSubmit();

      const payload = mockPartnerService.create.mock.calls[0][0];
      expect(payload.addresses).toHaveLength(1);
      expect(payload.addresses[0]).toMatchObject({
        type: 'BILLING',
        country_id: 1,
        state_id: 35,
        city_id: 5503089,
        street: 'Rua das Flores',
      });
    });
  });
});