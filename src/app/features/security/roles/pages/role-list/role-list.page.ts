import { MasterListComponent } from './../../../../../shared/components/master-list/master-list.component';
import { Component, inject } from '@angular/core';
import { BreadcrumbComponent } from "../../../../../shared/components/breadcrumb/breadcrumb.component";
import { MenuItem } from 'primeng/api';
import { RoleService } from '../../services/role-service';
import { Role } from '../../models/role';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { Router } from '@angular/router';
import { TableColumn } from '../../../../../core/models/table-column';
import { ColumnType } from '../../../../../core/enums/column-type';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    MasterListComponent
  ],
  templateUrl: './role-list.page.html',
  styleUrl: './role-list.page.scss',
})
export class RoleListPage {
  private router = inject(Router);
  private roleService: RoleService = inject(RoleService);

  breadcrumbItems: MenuItem[] = [
    { label: 'Segurança' },
    { label: 'Papéis' },
    { label: 'Listar', routerLink: '/security/roles' }
  ];
  listFn = (params: any) => this.roleService.list(params);
  cols: TableColumn<Role>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.INTEGER },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.TEXT },
    { field: 'description', header: 'Descrição', sortable: false, type: ColumnType.TEXT }
  ];
  tableMenu: TableMenuItem<Role>[] = [
    { 
      label: 'Visualizar', 
      icon: 'pi pi-eye',
      action: (record?: Role) => this.router.navigate([`form/${record?.id}/view`])
    },
    { 
      label: 'Editar', 
      icon: 'pi pi-pencil', 
      action: (record?: Role) => this.router.navigate([`form/${record?.id}`])
    },
    { 
      label: 'Deletar', 
      icon: 'pi pi-trash' 
    },
    { 
      separator: true 
    },
    { 
      label: 'Permissões', 
      icon: 'pi pi-star',
      action: (record?: Role) => this.router.navigate([`${record?.id}/permissions`]) 
    }
  ];
}
