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
import { Country } from '../../models/country';
import { CountryService } from '../../services/country-service';

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
  selector: 'app-country-list',
  imports: [
    ListPageUi,
    CrudListComponent, 
    RouterOutlet,
    AppTemplate
  ],
  templateUrl: './country-list.page.html',
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: CountryService) => new CrudListFacade<Country>(service, {
        create: '',
        update: '',
        view: 'countries.view',
        delete: ''
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        CountryService
      ]
    }
  ],
  styleUrl: './country-list.page.scss',
})
export class CountryListPage  implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<Country> = inject(CrudListFacade<Country>);

  title: WritableSignal<string> = signal<string>('Listar países')
  breadcrumbItems: MenuItem[] = [
    { label: 'Geografia' },
    { label: 'Países' },
    { label: 'Listar', routerLink: '/geography/countries' }
  ];
  cols: TableColumn<Country>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'iso_code', header: 'Código ISO', sortable: false, type: ColumnType.Text }
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'iso_code', label: 'Código ISO', type: ColumnType.Text }
  ]
  tableMenu: TableMenuItem<Country>[] = [
    { 
      label: 'Visualizar', 
      icon: 'pi pi-eye',
      permission: 'countries.view',
      action: (record?: Country) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
