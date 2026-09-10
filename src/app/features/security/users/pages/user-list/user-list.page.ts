import { Component, inject, signal, TemplateRef, ViewChild, WritableSignal, AfterViewInit } from '@angular/core';
import { CrudListComponent } from '../../../../../shared/components/crud-list/crud-list.component';
import { ListPageUi } from '../../../../../shared/ui/list-page/list-page.ui';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { UserService } from '../../services/user-service';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { TableColumn } from '../../../../../core/models/table-column';
import { ColumnType } from '../../../../../core/enums/column-type';
import { FilterFieldDefinition } from '../../../../../core/models/filter-field-definition';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { TagModule } from 'primeng/tag';
import { PhonePipe } from '../../../../../shared/pipes/phone-pipe';

@Component({
  selector: 'app-user-list',
  imports: [
    CrudListComponent,
    ListPageUi,
    AppTemplate,
    TagModule
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: UserService) => new CrudListFacade<User>(service, {
        create: 'users.create',
        update: 'users.update',
        view: 'users.view',
        delete: 'users.delete'
      }),
      deps: [
        UserService
      ]
    }
  ],
  templateUrl: './user-list.page.html',
  styleUrl: './user-list.page.scss',
})
export class UserListPage implements AfterViewInit {
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public facade: CrudListFacade<User> = inject(CrudListFacade<User>);

  @ViewChild('rolesTemplate') rolesTemplate!: TemplateRef<any>;

  title: WritableSignal<string> = signal<string>('Listar usuários')
  breadcrumbItems: MenuItem[] = [
    { label: 'Segurança' },
    { label: 'Usuários' },
    { label: 'Listar', routerLink: '/security/users' }
  ];
  cols: TableColumn<User>[] = [];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'email', label: 'E-mail', type: ColumnType.Text },
    { name: 'username', label: 'Usuário', type: ColumnType.Text },
    { name: 'phone_number', label: 'Telefone', type: ColumnType.Text, mask: 'PHONE_BR' },
    { name: 'is_admin', label: 'Admin', type: ColumnType.Boolean },
  ]
  tableMenu: TableMenuItem<User>[] = [
    { 
      label: 'Visualizar', 
      icon: 'pi pi-eye',
      permission: 'users.view',
      action: (record?: User) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    { 
      label: 'Editar', 
      icon: 'pi pi-pencil',
      permission: 'users.edit',
      action: (record?: User) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    { 
      label: 'Deletar', 
      icon: 'pi pi-trash',
      permission: 'users.delete',
      action: (record?: User) => record && this.facade.delete(record)
    }
  ];

  ngAfterViewInit(): void {
    this.cols = [
      { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
      { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
      { field: 'email', header: 'E-mail', sortable: true, type: ColumnType.Text },
      { field: 'username', header: 'Usuário', sortable: true, type: ColumnType.Text },
      { field: 'phone_number', header: 'Telefone', sortable: true, type: ColumnType.Text, pipe: new PhonePipe() },
      { field: 'is_admin', header: 'Admin', sortable: true, type: ColumnType.Boolean },
      { field: 'roles', header: 'Perfis', sortable: false, template: this.rolesTemplate }
    ]
  }
}
