import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { FormPageUi } from '../../../../../shared/ui/form-page/form-page.ui';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { CrudFormFacade } from '../../../../../shared/facades/crud-form.facade';
import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { MenuItem } from 'primeng/api';
import { FormMode, FormModeLabel } from '../../../../../core/enums/form-mode';
import { LookupComponent } from "../../../../../shared/components/lookup/lookup.component";
import { RoleService } from '../../../roles/services/role-service';
import { LookupFacade } from '../../../../../shared/facades/lookup.facade';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PasswordModule } from 'primeng/password';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { InputMaskModule } from 'primeng/inputmask';

type FormType = {
  name: FormControl<string>;
  username: FormControl<string>;
  email: FormControl<string>;
  phone_number: FormControl<string>;
  password: FormControl<string>;
  password_confirmation: FormControl<string>;
  roles: FormControl<LookupItem[]>;
  is_admin: FormControl<boolean>;
}

@Component({
  selector: 'app-user-form',
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
    LookupComponent,
    ToggleSwitchModule,
    PasswordModule,
    InputMaskModule,
    FormControlErrorsComponent
],
  providers: [
    {
      provide: CrudFormFacade<User>,
      useFactory: (service: UserService) =>
        new CrudFormFacade<User>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'users.create',
            update: 'users.update',
            view: 'users.view'
          }
        }),
      deps: [UserService]
    }
  ],
  templateUrl: './user-form.page.html',
  styleUrl: './user-form.page.scss',
})
export class UserFormPage {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  public facade: CrudFormFacade<User> = inject(CrudFormFacade<User>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private roleService: RoleService = inject(RoleService);

  roleLookupFacade: LookupFacade = new LookupFacade(this.roleService);
  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    username: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.maxLength(80), Validators.email]],
    phone_number: ['', [Validators.maxLength(14)]],
    password: ['', [Validators.required, Validators.maxLength(255)]],
    password_confirmation: ['', [Validators.required, Validators.maxLength(255)]],
    roles: [[] as LookupItem[], []],
    is_admin: [false, []],
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
    this.configureFormValidators();
  }

  private configureFormValidators(): void {
    const password = this.form.controls.password;
    const confirmation = this.form.controls.password_confirmation;

    if (this.facade.isCreate()) {
      password.addValidators(Validators.required);
      password.addValidators(Validators.maxLength(255));
      confirmation.addValidators(Validators.required);
      confirmation.addValidators(Validators.maxLength(255));
    } else {
      password.clearValidators();
      confirmation.clearValidators();
    }

    password.updateValueAndValidity();
    confirmation.updateValueAndValidity();
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe();
  }

  isInvalid(controlName: keyof FormType): boolean {
    return (this.form.get(controlName)?.invalid ?? false) && ((this.form.get(controlName)?.dirty ?? false) || (this.form.get(controlName)?.touched ?? false))
  }
}