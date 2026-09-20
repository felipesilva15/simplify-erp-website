import { Component, computed, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { FormMode, FormModeLabel } from '../../../../../core/enums/form-mode';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { FormPageUi } from '../../../../../shared/ui/form-page/form-page.ui';
import { CollapsibleSectionComponent } from '../../../../../shared/components/collapsible-section/collapsible-section.component';
import { PartnerTypeLookupComponent } from '../../../partner-types/components/partner-type-lookup/partner-type-lookup.component';
import { Partner } from '../../models/partner';
import { PartnerService } from '../../services/partner-service';
import { PersonType, PersonTypeOptions } from '../../enums/person-type';
import { TaxpayerType, TaxpayerTypeOptions } from '../../enums/taxpayer-type';
import { Gender, GenderOptions } from '../../enums/gender';
import { MaritalStatus, MaritalStatusOptions } from '../../enums/marital-status';
import { PixType, PixTypeOptions } from '../../enums/pix-type';
import { NgxMaskDirective } from 'ngx-mask';
import { InputMaskModule } from 'primeng/inputmask';

interface FormType {
  name: FormControl<string>;
  trade_name: FormControl<string>;
  partner_type_code: FormControl<LookupItem | null>;
  person_type: FormControl<PersonType>;
  taxpayer_type: FormControl<TaxpayerType>;
  document_number: FormControl<string>;
  identity_number: FormControl<string>;
  identity_issuer: FormControl<string>;
  partner_since: FormControl<Date | null>;
  state_registration: FormControl<string>;
  municipal_registration: FormControl<string>;
  suframa_registration: FormControl<string>;
  marital_status: FormControl<MaritalStatus | null>;
  cbo: FormControl<LookupItem | null>;
  gender: FormControl<Gender | null>;
  birth_date: FormControl<Date | null>;
  father_name: FormControl<string>;
  father_document: FormControl<string>;
  mother_name: FormControl<string>;
  mother_document: FormControl<string>;
  pix_type: FormControl<PixType | null>;
  pix_key: FormControl<string>;
  notes: FormControl<string>;
}

@Component({
  selector: 'app-partner-form',
  imports: [
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    SkeletonModule,
    InputTextModule,
    ButtonModule,
    FluidModule,
    FormPageUi,
    AppTemplate,
    FormControlErrorsComponent,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    CollapsibleSectionComponent,
    PartnerTypeLookupComponent,
    NgxMaskDirective,
    InputMaskModule
],
  providers: [
    {
      provide: GenericCrudFormFacade<Partner>,
      useFactory: (service: PartnerService) =>
        new GenericCrudFormFacade<Partner>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'partners.create',
            update: 'partners.update',
            view: 'partners.view'
          },
        }),
      deps: [PartnerService]
    }
  ],
  templateUrl: './partner-form.page.html',
  styleUrl: './partner-form.page.scss',
})
export class PartnerFormPage implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  public facade: GenericCrudFormFacade<Partner> = inject(GenericCrudFormFacade<Partner>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);

  personTypeOptions: { code: PersonType, name: string }[] = PersonTypeOptions;
  taxpayerTypeOptions: { code: TaxpayerType, name: string }[] = TaxpayerTypeOptions;
  genderOptions: { code: Gender, name: string }[] = GenderOptions;
  maritalStatusOptions: { code: MaritalStatus, name: string }[] = MaritalStatusOptions;
  pixTypeOptions: { code: PixType, name: string }[] = PixTypeOptions;

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    trade_name: ['', [Validators.required, Validators.maxLength(150)]],
    partner_type_code: new FormControl<LookupItem | null>(null, [Validators.required]),
    person_type: [PersonType.Person, [Validators.required]],
    taxpayer_type: [TaxpayerType.Taxpayer, [Validators.required]],
    document_number: ['', [Validators.required, Validators.maxLength(20)]],
    identity_number: ['', [Validators.maxLength(15)]],
    identity_issuer: ['', [Validators.maxLength(20)]],
    partner_since: new FormControl<Date | null>(null),
    state_registration: ['', [Validators.maxLength(14)]],
    municipal_registration: ['', [Validators.maxLength(15)]],
    suframa_registration: ['', [Validators.maxLength(9)]],
    marital_status: new FormControl<MaritalStatus | null>(null),
    cbo: new FormControl<LookupItem | null>(null),
    gender: new FormControl<Gender | null>(null),
    birth_date: new FormControl<Date | null>(null),
    father_name: ['', [Validators.maxLength(120)]],
    father_document: ['', [Validators.maxLength(15)]],
    mother_name: ['', [Validators.maxLength(120)]],
    mother_document: ['', [Validators.maxLength(15)]],
    pix_type: new FormControl<PixType | null>(null),
    pix_key: ['', []],
    notes: ['', []],
  });
  
  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
  
  modeLabel: Signal<string> = computed(() => FormModeLabel[this.mode()]);
  title: Signal<string> = computed(() => this.modeLabel() + ' parceiro');
  activeBreadcrumbItemLabel: Signal<string> = computed(() => this.modeLabel() + (this.id() ? ` (ID: ${this.id()})`: ''))

  constructor() {
    this.id.set(Number(this.activatedRoute.snapshot.paramMap.get('id')));
    this.mode.set(this.routeUtilsService.getFormModeFromCurrentUrl());

    this.breadcrumbItems = [
      { label: 'Parceiros' },
      { label: 'Parceiros' },
      { label: 'Listar', routerLink: '/partner/partners' },
      { label: this.activeBreadcrumbItemLabel(), routerLink: this.router.url }
    ];
  }

  async ngOnInit(): Promise<void> {
    await this.facade.init(this.mode(), this.form, this.id());
    this.configureFormValidators();
  }

  private configureFormValidators(): void {
    console.log('not implemented!');
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe();
  }

  isInvalid(controlName: keyof FormType): boolean {
    return (this.form.get(controlName)?.invalid ?? false) && ((this.form.get(controlName)?.dirty ?? false) || (this.form.get(controlName)?.touched ?? false))
  }
}
