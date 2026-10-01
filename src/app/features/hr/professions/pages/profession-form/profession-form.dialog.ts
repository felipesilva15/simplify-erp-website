import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FormMode } from '../../../../../core/enums/form-mode';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { DynamicDialogService } from '../../../../../shared/services/dynamic-dialog-service';
import { Profession } from '../../models/profession';
import { ProfessionService } from '../../services/profession-service';
import { FormDialogUi } from '../../../../../shared/ui/form-dialog/form-dialog.ui';
import { FluidModule } from 'primeng/fluid';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AppTemplate } from '../../../../../shared/directives/app-template';

interface FormType {
  name: FormControl<string>;
  cbo: FormControl<string>;
}

@Component({
  selector: 'app-profession-form',
  imports: [
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    FormDialogUi,
    FluidModule, 
    FormControlErrorsComponent, 
    SkeletonModule, 
    ButtonModule, 
    AppTemplate
  ],
  providers: [
    {
      provide: GenericCrudFormFacade<Profession>,
      useFactory: (service: ProfessionService) =>
        new GenericCrudFormFacade<Profession>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: '',
            update: '',
            view: 'professions.view'
          }
        }),
      deps: [ProfessionService]
    }
  ],
  templateUrl: './profession-form.dialog.html',
  styleUrl: './profession-form.dialog.scss',
})
export class ProfessionFormDialog implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public facade: GenericCrudFormFacade<Profession> = inject(GenericCrudFormFacade<Profession>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  private dynamicDialogService: DynamicDialogService = inject(DynamicDialogService);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', []],
    cbo: ['', []]
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
