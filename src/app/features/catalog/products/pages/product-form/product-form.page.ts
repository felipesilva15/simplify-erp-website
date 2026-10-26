import { Component, computed, inject, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { FormMode, FormModeLabel } from '../../../../../core/enums/form-mode';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { FormPageUi } from '../../../../../shared/ui/form-page/form-page.ui';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product-service';
import { ItemTypeCode, ItemTypeCodeOptions } from '../../enums/item-type-code';
import { MeasurementUnitLookupComponent } from '../../../measurement-units/components/measurement-unit-lookup/measurement-unit-lookup.component';
import { ProductCategoryLookupComponent } from '../../../product-categories/components/product-category-lookup/product-category-lookup.component';
import { ProductBrandLookupComponent } from '../../../product-brands/components/product-brand-lookup/product-brand-lookup.component';
import { LookupItem } from '../../../../../core/models/lookup-item';

interface FormType {
  item_type_code: FormControl<ItemTypeCode>;
  sku: FormControl<string>;
  gtin: FormControl<string>;
  name: FormControl<string>;
  measurement_unit_id: FormControl<LookupItem | null>;
  product_category_id: FormControl<LookupItem | null>;
  product_brand_id: FormControl<LookupItem | null>;
  description: FormControl<string>;
  notes: FormControl<string>;
  price: FormControl<number>;
  cost: FormControl<number>;
  net_weight: FormControl<number>;
  gross_weight: FormControl<number>;
  width: FormControl<number>;
  height: FormControl<number>;
  length: FormControl<number>;
  minimum_stock: FormControl<number>;
  maximum_stock: FormControl<number>;
  is_active: FormControl<boolean>;
}

@Component({
  selector: 'app-product-form',
  imports: [
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    ToggleSwitchModule,
    SelectModule,
    MeasurementUnitLookupComponent,
    ProductCategoryLookupComponent,
    ProductBrandLookupComponent,
    ButtonModule,
    FluidModule,
    FormPageUi,
    AppTemplate,
    FormControlErrorsComponent,
    SkeletonModule
  ],
  providers: [
    {
      provide: GenericCrudFormFacade<Product>,
      useFactory: (service: ProductService) =>
        new GenericCrudFormFacade<Product>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'products.create',
            update: 'products.update',
            view: 'products.view'
          }
        }),
      deps: [ProductService]
    }
  ],
  templateUrl: './product-form.page.html',
  styleUrl: './product-form.page.scss',
})
export class ProductFormPage implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  public facade: GenericCrudFormFacade<Product> = inject(GenericCrudFormFacade<Product>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    item_type_code: [ItemTypeCode.MerchandiseForResale, [Validators.required]],
    sku: ['', [Validators.required, Validators.maxLength(255)]],
    gtin: ['', [Validators.required, Validators.maxLength(255)]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    measurement_unit_id: new FormControl<LookupItem | null>(null, [Validators.required]),
    product_category_id: new FormControl<LookupItem | null>(null, [Validators.required]),
    product_brand_id: new FormControl<LookupItem | null>(null, [Validators.required]),
    description: ['', [Validators.required, Validators.maxLength(512)]],
    notes: ['', [Validators.required, Validators.maxLength(512)]],
    price: [0, [Validators.required]],
    cost: [0, [Validators.required]],
    net_weight: [0, [Validators.required]],
    gross_weight: [0, [Validators.required]],
    width: [0, [Validators.required]],
    height: [0, [Validators.required]],
    length: [0, [Validators.required]],
    minimum_stock: [0, [Validators.required]],
    maximum_stock: [0, [Validators.required]],
    is_active: [false, [Validators.required]],
  });

  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
  itemTypeCodeOptions: { code: ItemTypeCode, name: string }[] = ItemTypeCodeOptions;

  modeLabel: Signal<string> = computed(() => FormModeLabel[this.mode()]);
  title: Signal<string> = computed(() => this.modeLabel() + ' produto');
  activeBreadcrumbItemLabel: Signal<string> = computed(() => this.modeLabel() + (this.id() ? ` (ID: ${this.id()})` : ''))

  constructor() {
    this.id.set(Number(this.activatedRoute.snapshot.paramMap.get('id')));
    this.mode.set(this.routeUtilsService.getFormModeFromCurrentUrl());

    this.breadcrumbItems = [
      { label: 'Catálogo' },
      { label: 'Produtos' },
      { label: 'Listar', routerLink: '/catalog/products' },
      { label: this.activeBreadcrumbItemLabel(), routerLink: this.router.url }
    ];
  }

  async ngOnInit(): Promise<void> {
    await this.facade.init(this.mode(), this.form, this.id());
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe();
  }

  isInvalid(controlName: keyof FormType): boolean {
    return (this.form.get(controlName)?.invalid ?? false) && ((this.form.get(controlName)?.dirty ?? false) || (this.form.get(controlName)?.touched ?? false))
  }
}
