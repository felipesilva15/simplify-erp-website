import { CrudListFacade } from './../../../../../shared/facades/crud-list.facade';
import { Role } from './../../models/role';
import { CrudListComponent } from './../../../../../shared/components/crud-list/crud-list.component';
import { Component, inject } from '@angular/core';
import { BreadcrumbComponent } from "../../../../../shared/components/breadcrumb/breadcrumb.component";
import { MenuItem } from 'primeng/api';
import { RoleService } from '../../services/role-service';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { ActivatedRoute, Router } from '@angular/router';
import { TableColumn } from '../../../../../core/models/table-column';
import { ColumnType } from '../../../../../core/enums/column-type';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    CrudListComponent
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: RoleService) => new CrudListFacade<Role>(service, {
        create: 'roles.create',
        update: 'roles.update',
        view: 'roles.view',
        delete: 'roles.delete'
      }),
      deps: [
        RoleService
      ]
    }
  ],
  templateUrl: './role-list.page.html',
  styleUrl: './role-list.page.scss',
})
export class RoleListPage {
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  constructor(public facade: CrudListFacade<Role>) { }

  breadcrumbItems: MenuItem[] = [
    { label: 'Segurança' },
    { label: 'Perfis' },
    { label: 'Listar', routerLink: '/security/roles' }
  ];
  cols: TableColumn<Role>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.INTEGER },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.TEXT },
    { field: 'description', header: 'Descrição', sortable: false, type: ColumnType.TEXT }
  ];
  tableMenu: TableMenuItem<Role>[] = [
    { 
      label: 'Visualizar', 
      icon: 'pi pi-eye',
      permission: 'roles.view',
      action: (record?: Role) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    { 
      label: 'Editar', 
      icon: 'pi pi-pencil',
      permission: 'roles.edit',
      action: (record?: Role) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    { 
      label: 'Deletar', 
      icon: 'pi pi-trash',
      permission: 'roles.delete',
      action: (record?: Role) => record && this.facade.delete(record)
    },
    { 
      separator: true 
    },
    { 
      label: 'Permissões', 
      icon: 'pi pi-star',
      permission: 'roles.definePermissions',
      action: (record?: Role) => this.router.navigate([record?.id, 'permissions'], { relativeTo: this.activatedRoute }) 
    }
  ];
}
