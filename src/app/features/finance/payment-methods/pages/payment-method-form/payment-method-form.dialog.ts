import { FormLabelComponent } from '../../../../../shared/components/form-label/form-label.component';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FluidModule } from 'primeng/fluid';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FormMode } from '../../../../../core/enums/form-mode';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { DynamicDialogService } from '../../../../../shared/services/dynamic-dialog-service';
import { FormDialogUi } from '../../../../../shared/ui/form-dialog/form-dialog.ui';
import { PaymentMethod } from '../../models/payment-method';
import { PaymentMethodService } from '../../services/payment-method-service';
import { PaymentType, PaymentTypeOptions } from '../../enums/payment-type';
import { FinanceApplicability, FinanceApplicabilityOptions } from '../../enums/finance-applicability';
import { TaxType, TaxTypeOptions } from '../../enums/tax-type';
import { DecimalControl, DecimalFormControl } from '../../../../../shared/forms/decimal-control';

interface FormType {
  name: FormControl<string>;
  condition: FormControl<string>;
  payment_type: FormControl<PaymentType>;
  applicable_type: FormControl<FinanceApplicability>;
  tax_type: FormControl<TaxType | null>;
  tax_aliquot: DecimalFormControl;
  tax_fixed_value: DecimalFormControl;
  penalty_aliquot: DecimalFormControl;
  interest_aliquot: DecimalFormControl;
  payment_deadline: FormControl<number>;
}

@Component({
  selector: 'app-payment-method-form',
  imports: [
    FormLabelComponent,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    FormDialogUi,
    FluidModule,
    FormControlErrorsComponent,
    SkeletonModule,
    ButtonModule,
    AppTemplate
  ],
  providers: [
    {
      provide: GenericCrudFormFacade<PaymentMethod>,
      useFactory: (service: PaymentMethodService) =>
        new GenericCrudFormFacade<PaymentMethod>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'paymentMethods.create',
            update: 'paymentMethods.update',
            view: 'paymentMethods.view'
          }
        }),
      deps: [PaymentMethodService]
    }
  ],
  templateUrl: './payment-method-form.dialog.html',
  styleUrl: './payment-method-form.dialog.scss',
})
export class PaymentMethodFormDialog implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public facade: GenericCrudFormFacade<PaymentMethod> = inject(GenericCrudFormFacade<PaymentMethod>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  private dynamicDialogService: DynamicDialogService = inject(DynamicDialogService);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    condition: ['', [Validators.required, Validators.maxLength(80)]],
    payment_type: [PaymentType.Cash, [Validators.required]],
    applicable_type: [FinanceApplicability.Credit, [Validators.required]],
    tax_type: new FormControl<TaxType | null>(null, []),
    tax_aliquot: new DecimalControl(2, { value: null, disabled: false }, [Validators.min(0), Validators.max(99999.99)]),
    tax_fixed_value: new DecimalControl(4, { value: null, disabled: false }, [Validators.min(0), Validators.max(99999999999.9999)]),
    penalty_aliquot: new DecimalControl(2, { value: null, disabled: false }, [Validators.min(0), Validators.max(99999.99)]),
    interest_aliquot: new DecimalControl(2, { value: null, disabled: false }, [Validators.min(0), Validators.max(99999.99)]),
    payment_deadline: [0, []],
  });

  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
  paymentTypeOptions: { code: PaymentType, name: string }[] = PaymentTypeOptions;
  financeApplicabilityOptions: { code: FinanceApplicability, name: string }[] = FinanceApplicabilityOptions;
  taxTypeOptions: { code: TaxType, name: string }[] = TaxTypeOptions;

  constructor() {
    const routeParam: string | null = this.activatedRoute.snapshot.paramMap.get('id');
    const routeId = routeParam === null ? Number.NaN : Number(routeParam);
    const dialogId = Number((this.dialogConfig?.data as { id?: number } | undefined)?.id);

    this.id.set(Number.isNaN(routeId) ? (Number.isNaN(dialogId) ? 0 : dialogId) : routeId);
    this.mode.set(this.routeUtilsService.getFormModeFromCurrentUrl());
  }

  async ngOnInit(): Promise<void> {
    await this.facade.init(this.mode(), this.form, this.id());
  }

  close(): void {
    this.dynamicDialogService.close();
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe({
      next: () => this.dialogRefreshService.notifySaved(),
    });
  }

  isInvalid(controlName: keyof FormType): boolean {
    return (this.form.get(controlName)?.invalid ?? false) && ((this.form.get(controlName)?.dirty ?? false) || (this.form.get(controlName)?.touched ?? false))
  }
}
