import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
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
import { State } from '../../models/state';
import { StateService } from '../../services/state-service';

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
  selector: 'app-state-list',
  imports: [
    ListPageUi,
    CrudListComponent, 
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: StateService) => new CrudListFacade<State>(service, {
        create: '',
        update: '',
        view: 'states.view',
        delete: ''
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        StateService
      ]
    }
  ],
  templateUrl: './state-list.page.html',
  styleUrl: './state-list.page.scss',
})
export class StateListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<State> = inject(CrudListFacade<State>);

  title: WritableSignal<string> = signal<string>('Listar estados')
  breadcrumbItems: MenuItem[] = [
    { label: 'Geografia' },
    { label: 'Estados' },
    { label: 'Listar', routerLink: '/geography/states' }
  ];
  cols: TableColumn<State>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'uf', header: 'UF', sortable: true, type: ColumnType.Text },
    { field: 'ibge_code', header: 'Código IBGE', sortable: true, type: ColumnType.Text }
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'uf', label: 'UF', type: ColumnType.Text },
    { name: 'ibge_code', label: 'Código IBGE', type: ColumnType.Text }
  ]
  tableMenu: TableMenuItem<State>[] = [
    { 
      label: 'Visualizar', 
      icon: 'pi pi-eye',
      permission: 'states.view',
      action: (record?: State) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
