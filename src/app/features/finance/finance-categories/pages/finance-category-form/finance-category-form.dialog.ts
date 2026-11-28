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
import { SelectModule } from 'primeng/select';
import { FormMode } from '../../../../../core/enums/form-mode';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { DynamicDialogService } from '../../../../../shared/services/dynamic-dialog-service';
import { FormDialogUi } from '../../../../../shared/ui/form-dialog/form-dialog.ui';
import { FinanceCategory } from '../../models/finance-category';
import { FinanceCategoryService } from '../../services/finance-category-service';
import { FinanceCategoryLookupComponent } from '../../components/finance-category-lookup/finance-category-lookup.component';
import { FinanceApplicability, FinanceApplicabilityOptions } from '../../../payment-methods/enums/finance-applicability';
import { LookupItem } from '../../../../../core/models/lookup-item';

interface FormType {
  name: FormControl<string>;
  code: FormControl<string>;
  parent_id: FormControl<LookupItem | null>;
  applicable_type: FormControl<FinanceApplicability>;
}

@Component({
  selector: 'app-finance-category-form',
  imports: [
    FormLabelComponent,
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    FinanceCategoryLookupComponent,
    FormDialogUi,
    FluidModule,
    FormControlErrorsComponent,
    SkeletonModule,
    ButtonModule,
    AppTemplate
  ],
  providers: [
    {
      provide: GenericCrudFormFacade<FinanceCategory>,
      useFactory: (service: FinanceCategoryService) =>
        new GenericCrudFormFacade<FinanceCategory>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'financeCategories.create',
            update: 'financeCategories.update',
            view: 'financeCategories.view'
          }
        }),
      deps: [FinanceCategoryService]
    }
  ],
  templateUrl: './finance-category-form.dialog.html',
  styleUrl: './finance-category-form.dialog.scss',
})
export class FinanceCategoryFormDialog implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public facade: GenericCrudFormFacade<FinanceCategory> = inject(GenericCrudFormFacade<FinanceCategory>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  private dynamicDialogService: DynamicDialogService = inject(DynamicDialogService);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
    parent_id: new FormControl<LookupItem | null>(null, [Validators.required]),
    applicable_type: [FinanceApplicability.Credit, [Validators.required]],
  });

  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
  financeApplicabilityOptions: { code: FinanceApplicability, name: string }[] = FinanceApplicabilityOptions;

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
