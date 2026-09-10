import { AfterViewInit, Component, inject, signal, WritableSignal } from '@angular/core';
import { ListPageUi } from "../../../../../shared/ui/list-page/list-page.ui";
import { CrudListComponent } from "../../../../../shared/components/crud-list/crud-list.component";
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { CrudListFacade } from '../../../../../shared/facades/crud-list.facade';
import { PartnerService } from '../../services/partner-service';
import { Partner } from '../../models/partner';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ColumnType } from '../../../../../core/enums/column-type';
import { FilterFieldDefinition } from '../../../../../core/models/filter-field-definition';
import { TableColumn } from '../../../../../core/models/table-column';
import { TableMenuItem } from '../../../../../core/models/table-menu-item';
import { TaxpayerTypeLabels, TaxpayerTypeOptions } from '../../enums/taxpayer-type';
import { PixTypeLabels, PixTypeOptions } from '../../enums/pix-type';
import { PersonTypeLabels, PersonTypeOptions } from '../../enums/person-type';
import { DocumentPipe } from '../../../../../shared/pipes/document-pipe';

@Component({
  selector: 'app-partner-list',
  imports: [ 
    ListPageUi,
    CrudListComponent,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: PartnerService) => new CrudListFacade<Partner>(service, {
        create: 'partners.create',
        update: 'partners.update',
        view: 'partners.view',
        delete: 'partners.delete'
      }),
      deps: [
        PartnerService
      ]
    }
  ],
  templateUrl: './partner-list.page.html',
  styleUrl: './partner-list.page.scss',
})
export class PartnerListPage implements AfterViewInit {
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public facade: CrudListFacade<Partner> = inject(CrudListFacade<Partner>);

  title: WritableSignal<string> = signal<string>('Listar parceiros')
  breadcrumbItems: MenuItem[] = [
    { label: 'Parceiros' },
    { label: 'Parceiros' },
    { label: 'Listar', routerLink: '/partner/partners' }
  ];
  cols: TableColumn<Partner>[] = [];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'trade_name', label: 'Apelido', type: ColumnType.Text },
    { name: 'partner_type_code', label: 'Tipo de parceiro', type: ColumnType.Text },
    { name: 'person_type', label: 'Tipo de pessoa', type: ColumnType.Enum, options: PersonTypeOptions },
    { name: 'document_number', label: 'Documento', type: ColumnType.Text, mask: 'DOCUMENT' },
    { name: 'taxpayer_type', label: 'Contribuinte', type: ColumnType.Enum, options: TaxpayerTypeOptions },
    { name: 'pix_type', label: 'Tipo chave PIX', type: ColumnType.Enum, options: PixTypeOptions },
    { name: 'pix_key', label: 'Chave PIX', type: ColumnType.Text },
  ]
  tableMenu: TableMenuItem<Partner>[] = [
    { 
      label: 'Visualizar', 
      icon: 'pi pi-eye',
      permission: 'partners.view',
      action: (record?: Partner) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    { 
      label: 'Editar', 
      icon: 'pi pi-pencil',
      permission: 'partners.edit',
      action: (record?: Partner) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    { 
      label: 'Deletar', 
      icon: 'pi pi-trash',
      permission: 'partners.delete',
      action: (record?: Partner) => record && this.facade.delete(record)
    }
  ];

  ngAfterViewInit(): void {
    this.cols = [
      { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
      { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
      { field: 'trade_name', header: 'Apelido', sortable: true, type: ColumnType.Text },
      { field: 'partner_type_code', header: 'Tipo de parceiro', sortable: true, type: ColumnType.Text },
      { field: 'person_type', header: 'Tipo de pessoa', sortable: true, type: ColumnType.Enum, enumOptionLabels: PersonTypeLabels },
      { field: 'document_number', header: 'Documento', sortable: true, type: ColumnType.Text, pipe: new DocumentPipe() },
      { field: 'taxpayer_type', header: 'Contribuinte', sortable: true, type: ColumnType.Enum, enumOptionLabels: TaxpayerTypeLabels },
      { field: 'pix_type', header: 'Tipo chave PIX', sortable: true, type: ColumnType.Enum, enumOptionLabels: PixTypeLabels },
      { field: 'pix_key', header: 'Chave PIX', sortable: true, type: ColumnType.Text }
    ]
  }
}
