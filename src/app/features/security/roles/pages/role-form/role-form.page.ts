import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { CrudFormFacade } from '../../../../../shared/facades/crud-form.facade';
import { Role } from '../../models/role';
import { RoleService } from '../../services/role-service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormMode, FormModeLabel } from '../../../../../core/enums/form-mode';
import { MenuItem } from 'primeng/api';
import { BreadcrumbComponent } from "../../../../../shared/components/breadcrumb/breadcrumb.component";
import { DatePipe } from '@angular/common';
import { MessageModule } from "primeng/message";
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { FormPageUi } from "../../../../../shared/ui/form-page/form-page.ui";
import { AppTemplate } from "../../../../../shared/directives/app-template";
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';

type FormType = {
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
    FormPageUi,
    AppTemplate
],
  providers: [
    {
      provide: CrudFormFacade<Role>,
      useFactory: (service: RoleService) =>
        new CrudFormFacade<Role>(service, {
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
  templateUrl: './role-form.page.html',
  styleUrl: './role-form.page.scss',
})
export class RoleFormPage {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  public facade: CrudFormFacade<Role> = inject(CrudFormFacade<Role>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(512)]]
  });
  
  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.CREATE);
  
  modeLabel: Signal<string> = computed(() => FormModeLabel[this.mode()]);
  title: Signal<string> = computed(() => this.modeLabel() + ' perfil');
  activeBreadcrumbItemLabel: Signal<string> = computed(() => this.modeLabel() + (this.id() ? ` (ID: ${this.id()})`: ''))

  constructor() {
    this.id.set(Number(this.activatedRoute.snapshot.paramMap.get('id')));
    this.mode.set(this.routeUtilsService.getFormModeFromCurrentUrl());

    this.breadcrumbItems = [
      { label: 'Segurança' },
      { label: 'Perfis' },
      { label: 'Listar', routerLink: '/security/roles'},
      { label: this.activeBreadcrumbItemLabel(), routerLink: this.router.url }
    ];

    this.facade.init(this.mode(), this.form, this.id());
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe();
  }

  isInvalid(controlName: keyof FormType): boolean {
    return (this.form.get(controlName)?.invalid ?? false) && ((this.form.get(controlName)?.dirty ?? false) || (this.form.get(controlName)?.touched ?? false))
  }
}
