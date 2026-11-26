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
import { PaymentMethod } from '../../models/payment-method';
import { PaymentMethodService } from '../../services/payment-method-service';
import { PaymentTypeLabels, PaymentTypeOptions } from '../../enums/payment-type';
import { FinanceApplicabilityLabels, FinanceApplicabilityOptions } from '../../enums/finance-applicability';
import { TaxTypeLabels, TaxTypeOptions } from '../../enums/tax-type';

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
  selector: 'app-payment-method-list',
  imports: [
    ListPageUi,
    CrudListComponent,
    RouterOutlet,
    AppTemplate
  ],
  providers: [
    {
      provide: CrudListFacade,
      useFactory: (service: PaymentMethodService) => new CrudListFacade<PaymentMethod>(service, {
        create: 'paymentMethods.create',
        update: 'paymentMethods.update',
        view: 'paymentMethods.view',
        delete: 'paymentMethods.delete'
      }, {
        exportMenu: exportMenu
      }),
      deps: [
        PaymentMethodService
      ]
    }
  ],
  templateUrl: './payment-method-list.page.html',
  styleUrl: './payment-method-list.page.scss',
})
export class PaymentMethodListPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);
  public facade: CrudListFacade<PaymentMethod> = inject(CrudListFacade<PaymentMethod>);

  title: WritableSignal<string> = signal<string>('Listar métodos de pagamento')
  breadcrumbItems: MenuItem[] = [
    { label: 'Financeiro' },
    { label: 'Métodos de pagamento' },
    { label: 'Listar', routerLink: '/finance/payment-methods' }
  ];
  cols: TableColumn<PaymentMethod>[] = [
    { field: 'id', header: 'ID', sortable: true, type: ColumnType.Integer },
    { field: 'name', header: 'Nome', sortable: true, type: ColumnType.Text },
    { field: 'condition', header: 'Condição', sortable: true, type: ColumnType.Text },
    { field: 'payment_type', header: 'Tipo de pagamento', sortable: true, type: ColumnType.Enum, enumOptionLabels: PaymentTypeLabels },
    { field: 'applicable_type', header: 'Aplicável a', sortable: true, type: ColumnType.Enum, enumOptionLabels: FinanceApplicabilityLabels },
    { field: 'tax_type', header: 'Tipo de taxa', sortable: true, type: ColumnType.Enum, enumOptionLabels: TaxTypeLabels },
    { field: 'tax_aliquot', header: 'Alíquota da taxa', sortable: true, type: ColumnType.Percent },
    { field: 'tax_fixed_value', header: 'Valor fixo da taxa', sortable: true, type: ColumnType.Currency },
    { field: 'penalty_aliquot', header: 'Multa', sortable: true, type: ColumnType.Percent },
    { field: 'interest_aliquot', header: 'Juros (Mensal)', sortable: true, type: ColumnType.Percent },
    { field: 'payment_deadline', header: 'Prazo de pagamento (Dias)', sortable: true, type: ColumnType.Integer },
  ];
  filterDefinition: FilterFieldDefinition[] = [
    { name: 'id', label: 'ID', type: ColumnType.Integer },
    { name: 'name', label: 'Nome', type: ColumnType.Text },
    { name: 'condition', label: 'Condição', type: ColumnType.Text },
    { name: 'payment_type', label: 'Tipo de pagamento', type: ColumnType.Enum, options: PaymentTypeOptions },
    { name: 'applicable_type', label: 'Aplicável a', type: ColumnType.Enum, options: FinanceApplicabilityOptions },
    { name: 'tax_type', label: 'Tipo de taxa', type: ColumnType.Enum, options: TaxTypeOptions },
    { name: 'tax_aliquot', label: 'Alíquota da taxa', type: ColumnType.Percent },
    { name: 'tax_fixed_value', label: 'Valor fixo da taxa', type: ColumnType.Currency },
    { name: 'penalty_aliquot', label: 'Multa', type: ColumnType.Percent },
    { name: 'interest_aliquot', label: 'Juros (Mensal)', type: ColumnType.Percent },
    { name: 'payment_deadline', label: 'Prazo de pagamento (Dias)', type: ColumnType.Integer },
  ]
  tableMenu: TableMenuItem<PaymentMethod>[] = [
    {
      label: 'Visualizar',
      icon: 'pi pi-eye',
      permission: 'paymentMethods.view',
      action: (record?: PaymentMethod) => this.router.navigate([record?.id], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      permission: 'paymentMethods.edit',
      action: (record?: PaymentMethod) => this.router.navigate([record?.id, 'edit'], { relativeTo: this.activatedRoute })
    },
    {
      label: 'Deletar',
      icon: 'pi pi-trash',
      permission: 'paymentMethods.delete',
      action: (record?: PaymentMethod) => record && this.facade.delete(record)
    }
  ];

  ngOnInit(): void {
    this.dialogRefreshService.saved$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.facade.load());
  }
}
