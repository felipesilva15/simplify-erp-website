import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { FormPageUi } from "../../../../../shared/ui/form-page/form-page.ui";
import { FormMode, FormModeLabel } from '../../../../../core/enums/form-mode';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { MenuItem, TreeNode } from 'primeng/api';
import { RoleService } from '../../services/role-service';
import { TreeTableModule } from 'primeng/treetable';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { TreeNodeBuilder } from '../../../../../core/services/tree-node-builder';
import { Fluid } from "primeng/fluid";
import { Button } from "primeng/button";
import { TreeTableSelecionKey } from '../../../../../core/models/tree-table-selection-key';
import { RolePermissionFormFacade } from '../../facades/role-permission-form.facade';
import { Skeleton } from "primeng/skeleton";

interface FormType {
  ids: FormControl<number[]>;
}

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-role-define-permissions',
  imports: [FormPageUi, FormsModule, ReactiveFormsModule, TreeTableModule,
    AppTemplate, Fluid, Button, Skeleton],
  providers: [
    {
      provide: RolePermissionFormFacade,
      useFactory: (service: RoleService) =>
        new RolePermissionFormFacade(service, {
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
export class RoleDefinePermissionsPage implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  public facade: RolePermissionFormFacade = inject(RolePermissionFormFacade);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private treeNodeBuilder: TreeNodeBuilder = inject(TreeNodeBuilder);

  treeNode!: TreeNode[];
  rolePermissionKeys: WritableSignal<string[]> = signal<string[]>([]);
  selectionKeys: Record<string, TreeTableSelecionKey> = {};
  cols!: Column[];
  colors!: Record<number, string>;

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    ids: this.fb.nonNullable.control<number[]>([]),
  });
  
  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
  
  modeLabel: Signal<string> = computed(() => FormModeLabel[this.mode()]);
  title: Signal<string> = computed(() => 'Permissões do perfil');
  activeBreadcrumbItemLabel: Signal<string> = computed(() => 'Permissões' + (this.id() ? ` (ID: ${this.id()})`: ''))

  constructor() {
    this.id.set(Number(this.activatedRoute.snapshot.paramMap.get('id')));
    this.mode.set(this.routeUtilsService.getFormModeFromCurrentUrl());

    this.breadcrumbItems = [
      { label: 'Segurança' },
      { label: 'Perfis' },
      { label: 'Listar', routerLink: '/security/roles'},
      { label: this.activeBreadcrumbItemLabel(), routerLink: this.router.url }
    ];

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

  async ngOnInit(): Promise<void> {
    await this.facade.init(this.mode(), this.form, this.id());

    this.setRolePermissionKeys();
    this.buildTreeTableData();
  }

  setRolePermissionKeys(): void {
    if (!this.facade.entity() || !this.facade.entity()?.permissions.length) {
      this.rolePermissionKeys.set([])
      return;
    }

    const permissionKeys = this.facade.entity()?.permissions.map(
      (permission) => `${permission.resource.module_id}-${permission.resource.id}-${permission.id}`
    ) ?? [];

    this.rolePermissionKeys.set(permissionKeys);
  }

  buildTreeTableData(): void {
    this.treeNode = this.treeNodeBuilder.build(this.facade.state()?.modules ?? []);
    this.selectionKeys = this.treeNodeBuilder.flattenTreeWithSelection(this.treeNode, this.rolePermissionKeys());
  }

  onSubmit(): void {
    const permissionIds = Object.keys(this.selectionKeys)
      .filter((key) => key.split('-').length === 3 && this.selectionKeys[key].checked)
      .map((key) => Number(key.split('-')[2]));

    this.form.controls.ids.setValue(permissionIds);
    this.facade.submit(this.form, this.id()).subscribe();
  }
}
