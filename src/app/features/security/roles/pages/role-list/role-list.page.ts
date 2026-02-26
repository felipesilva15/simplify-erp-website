import { MasterListComponent } from './../../../../../shared/components/master-list/master-list.component';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { BreadcrumbComponent } from "../../../../../shared/components/breadcrumb/breadcrumb.component";
import { MenuItem } from 'primeng/api';
import { RoleService } from '../../services/role-service';
import { ApiResponse } from '../../../../../core/models/api-response';
import { Role } from '../../models/role';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { Router } from '@angular/router';

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
  cols: any[] = [
    { field: 'id', header: 'ID' },
    { field: 'name', header: 'Nome' },
    { field: 'description', header: 'Descrição' }
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
