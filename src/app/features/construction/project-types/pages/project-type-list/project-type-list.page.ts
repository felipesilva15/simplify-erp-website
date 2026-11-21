import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ColumnType } from '../../../../../core/enums/column-type';
import { ExportExtension } from '../../../../../core/enums/export-extension';
import { ExportFormat } from '../../../../../core/enums/export-format';
import { ExportMenuItem } from '../../../../../core/models/export-menu-item';
import { FilterFieldDefinition } from '../../../../../core/models/filter-field-definition';
import { TableColumn } from '../../../../../core/models/table-column';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { CrudListComponent } from '../../../../../shared/components/crud-list/crud-list.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { ListPageUi } from '../../../../../shared/ui/list-page/list-page.ui';
import { ProjectType } from '../../models/project-type';
import { ProjectTypeService } from '../../services/project-type-service';

const exportMenu: ExportMenuItem[] = [
  {
    label: 'Completo (Excel)',
    icon: 'pi pi-file-excel',
    extension: ExportExtension.Xlsx,
    format: ExportFormat.Completo,
  },
  {
    label: 'Completo (CSV)',
    icon: 'pi pi-file',
    extension: ExportExtension.Csv,
    format: ExportFormat.Completo,
  }
];

@Component({
  selector: 'app-project-type-list',
  imports: [
    ListPageUi,
    CrudListComponent,
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: ProjectTypeService) => new CrudListFacade<ProjectType>(service, {
        create: 'projectTypes.create',
        update: 'projectTypes.update',
        view: 'projectTypes.view',
        delete: 'projectTypes.delete'
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        ProjectTypeService
      ]
    }
  ],
  templateUrl: './project-type-list.page.html',
  styleUrl: './project-type-list.page.scss',
})
export class ProjectTypeListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<ProjectType> = inject(CrudListFacade<ProjectType>);

  title: WritableSignal<string> = signal<string>('Listar tipos de projeto')
  breadcrumbItems: MenuItem[] = [
    { label: 'Tipo de projeto' },
    { label: 'Tipos de projeto' },
    { label: 'Listar', routerLink: '/construction/project-types' }
  ];
  cols: TableColumn<ProjectType>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
  ]
  tableMenu: TableMenuItem<ProjectType>[] = [
    {
      label: 'Visualizar',
      icon: 'pi pi-eye',
      permission: 'projectTypes.view',
      action: (record?: ProjectType) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      permission: 'projectTypes.edit',
      action: (record?: ProjectType) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Deletar',
      icon: 'pi pi-trash',
      permission: 'projectTypes.delete',
      action: (record?: ProjectType) => record && this.facade.delete(record)
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
