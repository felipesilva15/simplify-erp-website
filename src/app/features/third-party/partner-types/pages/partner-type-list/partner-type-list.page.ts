import { Component, DestroyRef, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ListPageUi } from "../../../../../shared/ui/list-page/list-page.ui";
import { CrudListComponent } from "../../../../../shared/components/crud-list/crud-list.component";
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { PartnerTypeService } from '../../services/partner-type-service';
import { PartnerType } from '../../models/partner-type';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ColumnType } from '../../../../../core/enums/column-type';
import { TableColumn } from '../../../../../core/models/table-column';
import { MenuItem } from 'primeng/api';
import { FilterFieldDefinition } from '../../../../../core/models/filter-field-definition';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { ExportExtension } from '../../../../../core/enums/export-extension';
import { ExportFormat } from '../../../../../core/enums/export-format';
import { ExportMenuItem } from '../../../../../core/models/export-menu-item';

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
  selector: 'app-partner-type-list',
  imports: [
    ListPageUi,
    CrudListComponent,
    AppTemplate,
    RouterOutlet
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: PartnerTypeService) => new CrudListFacade<PartnerType>(service, {
        create: 'partnerTypes.create',
        update: 'partnerTypes.update',
        view: 'partnerTypes.view',
        delete: 'partnerTypes.delete'
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        PartnerTypeService
      ]
    }
  ],
  templateUrl: './partner-type-list.page.html',
  styleUrl: './partner-type-list.page.scss',
})
export class PartnerTypeListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<PartnerType> = inject(CrudListFacade<PartnerType>);

  title: WritableSignal<string> = signal<string>('Listar tipos de parceiro')
  breadcrumbItems: MenuItem[] = [
    { label: 'Terceiro' },
    { label: 'Tipos de parceiro' },
    { label: 'Listar', routerLink: '/third-party/partner-types' }
  ];
  cols: TableColumn<PartnerType>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'code', header: 'Código', sortable: false, type: ColumnType.Text }
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'code', label: 'Código', type: ColumnType.Text }
  ]
  tableMenu: TableMenuItem<PartnerType>[] = [
    { 
      label: 'Visualizar', 
      icon: 'pi pi-eye',
      permission: 'partnerTypes.view',
      action: (record?: PartnerType) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
