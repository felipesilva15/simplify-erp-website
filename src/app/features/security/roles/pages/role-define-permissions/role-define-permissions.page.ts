import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { FormPageUi } from "../../../../../shared/ui/form-page/form-page.ui";
import { FormMode, FormModeLabel } from '../../../../../core/enums/form-mode';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CrudFormFacade } from '../../../../../shared/facades/crud-form.facade';
import { Role } from '../../models/role';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { MenuItem, TreeNode } from 'primeng/api';
import { RoleService } from '../../services/role-service';
import { TreeTableModule } from 'primeng/treetable';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { ModuleService } from '../../../../configuration/modules/services/module-service';
import { Module } from '../../../../configuration/modules/models/module';
import { ApiResponse } from '../../../../../core/models/api-response';
import { ListRequestParams } from '../../../../../core/models/list-request-params';
import { finalize } from 'rxjs';
import { TreeNodeBuilder } from '../../../../../core/services/tree-node-builder';
import { Fluid } from "primeng/fluid";
import { Button } from "primeng/button";

type FormType = {
  ids: FormControl<string>;
}

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-role-define-permissions',
  imports: [FormPageUi, TreeTableModule,
    AppTemplate, Fluid, Button],
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
  templateUrl: './role-define-permissions.page.html',
  styleUrl: './role-define-permissions.page.scss',
})
export class RoleDefinePermissionsPage {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  public facade: CrudFormFacade<Role> = inject(CrudFormFacade<Role>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private moduleService: ModuleService = inject(ModuleService);
  private treeNodeBuilder: TreeNodeBuilder = inject(TreeNodeBuilder)
  modules!: Module[];
  treeNode!: TreeNode[];
  selectionKeys: any = {};
  cols!: Column[];
  colors!: Record<number, string>;

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    ids: ['', [Validators.required, Validators.maxLength(255)]],
  });
  
  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
  
  modeLabel: Signal<string> = computed(() => FormModeLabel[this.mode()]);
  title: Signal<string> = computed(() => 'Permissões do perfil');
  activeBreadcrumbItemLabel: Signal<string> = computed(() => 'Permissões' + (this.id() ? ` (ID: ${this.id()})`: ''))

  isLoadingModules: WritableSignal<boolean> = signal<boolean>(true);
  isLoading: Signal<boolean> = computed<boolean>(() => this.facade.loading() || this.isLoadingModules() )

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
    this.loadModules();
    
    this.cols = [
      { field: 'label', header: 'Nome' },
      { field: 'description', header: 'Descrição' }
    ];
    this.colors = {
      0: 'bg-primary-300',
      1: 'bg-primary-100',
      2: 'bg-primary-50'
    };
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe();
  }

  isInvalid(controlName: keyof FormType): boolean {
    return (this.form.get(controlName)?.invalid ?? false) && ((this.form.get(controlName)?.dirty ?? false) || (this.form.get(controlName)?.touched ?? false))
  }

  loadModules():void {
    this.isLoadingModules.set(true);

    const params: ListRequestParams = {
      filters: {
        is_active: {
          eq: 1
        }
      },
      page: 1,
      per_page: 100
    } 

    this.moduleService.list(params)
      .pipe(
        finalize(() => this.isLoadingModules.set(false))
      )
      .subscribe({
        next: (res: ApiResponse<Module[]>) => {
          this.modules = res.data;
          this.treeNode = this.treeNodeBuilder.build(this.modules);
        }
      });
  }
}
