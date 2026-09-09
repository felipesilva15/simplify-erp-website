import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { Role } from '../../models/role';
import { RoleService } from '../../services/role-service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormMode } from '../../../../../core/enums/form-mode';
import { MenuItem } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { FormDialogUi } from "../../../../../shared/ui/form-dialog/form-dialog.ui";
import { AppTemplate } from "../../../../../shared/directives/app-template";
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { FormControlErrorsComponent } from "../../../../../shared/components/form-control-errors/form-control-errors.component";
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DynamicDialogService } from '../../../../../shared/services/dynamic-dialog-service';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';

interface FormType {
  name: FormControl<string>;
  description: FormControl<string>;
}

@Component({
  selector: 'app-role-form',
  imports: [
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    SkeletonModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    FluidModule,
    FormDialogUi,
    AppTemplate,
    FormControlErrorsComponent
],
  providers: [
    {
      provide: GenericCrudFormFacade<Role>,
      useFactory: (service: RoleService) =>
        new GenericCrudFormFacade<Role>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'roles.create',
            update: 'roles.update',
            view: 'roles.view'
          }
        }),
      deps: [RoleService]
    }
  ],
  templateUrl: './role-form.dialog.html',
  styleUrl: './role-form.dialog.scss',
})
export class RoleFormDialog implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public facade: GenericCrudFormFacade<Role> = inject(GenericCrudFormFacade<Role>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  private dynamicDialogService: DynamicDialogService = inject(DynamicDialogService);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(512)]]
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