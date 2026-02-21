import { withInterceptors } from '@angular/common/http';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { BreadcrumbComponent } from "../../../../shared/components/breadcrumb/breadcrumb.component";
import { MenuItem } from 'primeng/api';
import { RoleService } from '../../services/role-service';
import { ApiResponse } from '../../../../core/models/api-response';
import { Role } from '../../models/role';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './role-list.page.html',
  styleUrl: './role-list.page.scss',
})
export class RoleListPage implements OnInit {
  private roleService: RoleService = inject(RoleService);

  breadcrumbItems: MenuItem[] = [
    { label: 'Segurança' },
    { label: 'Papéis' },
    { label: 'Listar', routerLink: '/security/roles' }
  ];

  apiResponse!: ApiResponse<Role[]>;
  isLoading: WritableSignal<boolean> = signal<boolean>(true);
  
  ngOnInit(): void {
    this.roleService.list().subscribe({
      next: (res: ApiResponse<Role[]>) =>  this.apiResponse = res
    })
  }
}
