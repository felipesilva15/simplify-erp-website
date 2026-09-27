import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { PartnerFormPage } from './partner-form.page';
import { PartnerService } from '../../services/partner-service';
import { AuthService } from '../../../../../core/auth/services/auth-service';
import { provideNgxMask } from 'ngx-mask';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LookupItem } from '../../../../../core/models/lookup-item';

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
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: PartnerService, useValue: mockPartnerService },
        { provide: AuthService, useValue: { user: { permissions: ['*'] } } },
        { provide: ConfirmationService, useValue: { confirm: vi.fn() } },
        { provide: MessageService, useValue: { add: vi.fn(), clear: vi.fn() } },
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
      } as LookupItem);

      component.onSubmit();

      expect(mockPartnerService.create).toHaveBeenCalled();

      const payload = mockPartnerService.create.mock.calls[0][0];
      expect(payload.partner_type_code).toBe('CODE-1');
    });
  });
});