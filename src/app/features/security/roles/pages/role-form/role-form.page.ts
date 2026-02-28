import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { CrudFormFacade } from '../../../../../shared/facades/crud-form.facade';
import { Role } from '../../models/role';
import { RoleService } from '../../services/role-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormMode, FormModeLabel } from '../../../../../core/enums/form-mode';
import { MenuItem } from 'primeng/api';
import { BreadcrumbComponent } from "../../../../../shared/components/breadcrumb/breadcrumb.component";
import { DatePipe, JsonPipe } from '@angular/common';
import { MessageModule } from "primeng/message";
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-role-form',
  imports: [
    BreadcrumbComponent,
    MessageModule,
    DatePipe,
    ReactiveFormsModule,
    SkeletonModule
  ],
  providers: [
    {
      provide: CrudFormFacade<Role>,
      useFactory: (service: RoleService) =>
        new CrudFormFacade<Role>(service, {
          successMessage: 'Registro salvo com sucesso!',
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

  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.CREATE);
  form: FormGroup = this.fb.group({
    name: ['', Validators.required, Validators.maxLength(80)],
    email: ['', Validators.maxLength(512)]
  });
  modeLabel: Signal<string> = computed(() => {
      return FormModeLabel[this.mode()]
  });
  title: Signal<string> = computed(() => this.modeLabel() + ' perfil')
  breadcrumbItems!: MenuItem[];
  activeBreadcrumbItemLabel: Signal<string> = computed(() => this.modeLabel() + (this.id() ? ` (ID: ${this.id()})`: ''))

  constructor(
    public facade: CrudFormFacade<Role>
  ) {
    this.id.set(Number(this.activatedRoute.snapshot.paramMap.get('id')));

    if (this.router.url.includes('new')) {
      this.mode.set(FormMode.CREATE);
    } else if (this.router.url.includes('edit')) {
      this.mode.set(FormMode.EDIT);
    } else {
      this.mode.set(FormMode.VIEW);
    }

    this.breadcrumbItems = [
      { label: 'Segurança' },
      { label: 'Perfis', routerLink: '/security/roles' },
      { label: this.activeBreadcrumbItemLabel(), routerLink: this.router.url }
    ]

    this.facade.init(this.mode(), this.form, this.id());
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe();
  }
}
