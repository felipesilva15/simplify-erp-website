import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ListPageUi } from '../../../../../shared/ui/list-page/list-page.ui';
import { CrudListComponent } from '../../../../../shared/components/crud-list/crud-list.component';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuItem } from 'primeng/api';
import { ColumnType } from '../../../../../core/enums/column-type';
import { ExportExtension } from '../../../../../core/enums/export-extension';
import { ExportFormat } from '../../../../../core/enums/export-format';
import { ExportMenuItem } from '../../../../../core/models/export-menu-item';
import { FilterFieldDefinition } from '../../../../../core/models/filter-field-definition';
import { TableColumn } from '../../../../../core/models/table-column';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { Profession } from '../../models/profession';
import { ProfessionService } from '../../services/profession-service';
import { AppTemplate } from '../../../../../shared/directives/app-template';

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
  selector: 'app-profession-list',
  imports: [
    ListPageUi,
    CrudListComponent, 
    RouterOutlet,
    AppTemplate
  ],
  templateUrl: './profession-list.page.html',
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: ProfessionService) => new CrudListFacade<Profession>(service, {
        create: '',
        update: '',
        view: 'professions.view',
        delete: ''
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        ProfessionService
      ]
    }
  ],
  styleUrl: './profession-list.page.scss',
})
export class ProfessionListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<Profession> = inject(CrudListFacade<Profession>);

  title: WritableSignal<string> = signal<string>('Listar profissões')
  breadcrumbItems: MenuItem[] = [
    { label: 'RH' },
    { label: 'Profissões' },
    { label: 'Listar', routerLink: '/hr/professions' }
  ];
  cols: TableColumn<Profession>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'cbo', header: 'CBO', sortable: true, type: ColumnType.Text }
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'cbo', label: 'CBO', type: ColumnType.Text }
  ]
  tableMenu: TableMenuItem<Profession>[] = [
    { 
      label: 'Visualizar', 
      icon: 'pi pi-eye',
      permission: 'professions.view',
      action: (record?: Profession) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
