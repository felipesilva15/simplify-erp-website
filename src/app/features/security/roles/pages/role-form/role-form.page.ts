import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { Role } from '../../models/role';
import { RoleService } from '../../services/role-service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormMode, FormModeLabel } from '../../../../../core/enums/form-mode';
import { MenuItem } from 'primeng/api';
import { MessageModule } from "primeng/message";
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { FormPageUi } from "../../../../../shared/ui/form-page/form-page.ui";
import { AppTemplate } from "../../../../../shared/directives/app-template";
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { FormControlErrorsComponent } from "../../../../../shared/components/form-control-errors/form-control-errors.component";

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
    FormPageUi,
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
  templateUrl: './role-form.page.html',
  styleUrl: './role-form.page.scss',
})
export class RoleFormPage implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  public facade: GenericCrudFormFacade<Role> = inject(GenericCrudFormFacade<Role>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(512)]]
  });
  
  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
  
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
  }

  async ngOnInit(): Promise<void> {
    await this.facade.init(this.mode(), this.form, this.id());
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe();
  }

  isInvalid(controlName: keyof FormType): boolean {
    return (this.form.get(controlName)?.invalid ?? false) && ((this.form.get(controlName)?.dirty ?? false) || (this.form.get(controlName)?.touched ?? false))
  }
}