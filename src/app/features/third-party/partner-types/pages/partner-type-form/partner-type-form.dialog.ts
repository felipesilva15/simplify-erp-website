import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormDialogUi } from "../../../../../shared/ui/form-dialog/form-dialog.ui";
import { ButtonModule } from "primeng/button";
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { PartnerType } from '../../models/partner-type';
import { PartnerTypeService } from '../../services/partner-type-service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormMode } from '../../../../../core/enums/form-mode';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { MessageModule } from 'primeng/message';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DynamicDialogService } from '../../../../../shared/services/dynamic-dialog-service';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';

interface FormType {
  name: FormControl<string>;
  code: FormControl<string>;
}

@Component({
  selector: 'app-partner-type-form',
  imports: [
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    SkeletonModule,
    InputTextModule,
    TextareaModule,
    FluidModule,
    FormDialogUi,
    ButtonModule,
    AppTemplate,
    FormControlErrorsComponent
  ],
  providers: [
    {
      provide: GenericCrudFormFacade<PartnerType>,
      useFactory: (service: PartnerTypeService) =>
        new GenericCrudFormFacade<PartnerType>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'partnerTypes.create',
            update: 'partnerTypes.update',
            view: 'partnerTypes.view'
          }
        }),
      deps: [PartnerTypeService]
    }
  ],
  templateUrl: './partner-type-form.dialog.html',
  styleUrl: './partner-type-form.dialog.scss',
})
export class PartnerTypeFormDialog {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  private dynamicDialogService: DynamicDialogService = inject(DynamicDialogService);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: GenericCrudFormFacade<PartnerType> = inject(GenericCrudFormFacade<PartnerType>);

  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    code: ['', [Validators.required, Validators.maxLength(3)]]
  });

  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);

  constructor() {
    const routeParam: string | null = this.activatedRoute.snapshot.paramMap.get('id');
    const routeId = routeParam === null ? Number.NaN : Number(routeParam);
    const dialogId = Number((this.dialogConfig?.data as any)?.id);

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