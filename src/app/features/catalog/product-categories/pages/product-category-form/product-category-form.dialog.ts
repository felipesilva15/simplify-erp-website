import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { FluidModule } from 'primeng/fluid';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormMode } from '../../../../../core/enums/form-mode';
import { RouteUtilsService } from '../../../../../core/services/route-utils-service';
import { FormControlErrorsComponent } from '../../../../../shared/components/form-control-errors/form-control-errors.component';
import { AppTemplate } from '../../../../../shared/directives/app-template';
import { GenericCrudFormFacade } from '../../../../../shared/facades/generic-crud-form.facade';
import { DialogRefreshService } from '../../../../../shared/services/dialog-refresh.service';
import { DynamicDialogService } from '../../../../../shared/services/dynamic-dialog-service';
import { FormDialogUi } from '../../../../../shared/ui/form-dialog/form-dialog.ui';
import { ProductCategory } from '../../models/product-category';
import { ProductCategoryService } from '../../services/product-category-service';
import { ProductCategoryLookupComponent } from '../../components/product-category-lookup/product-category-lookup.component';
import { ProductApplicabilityOptions } from '../../enums/product-applicability';
import { SelectModule } from 'primeng/select';
import { LookupItem } from '../../../../../core/models/lookup-item';

interface FormType {
  name: FormControl<string>;
  parent_category_id: FormControl<LookupItem | null>;
  applicability: FormControl<string>;
  is_active: FormControl<boolean>;
}

@Component({
  selector: 'app-product-category-form',
  imports: [
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    ToggleSwitchModule,
    FormDialogUi,
    FluidModule,
    FormControlErrorsComponent,
    SkeletonModule,
    ButtonModule,
    AppTemplate,
    SelectModule,
    ProductCategoryLookupComponent
],
  providers: [
    {
      provide: GenericCrudFormFacade<ProductCategory>,
      useFactory: (service: ProductCategoryService) =>
        new GenericCrudFormFacade<ProductCategory>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'productCategories.create',
            update: 'productCategories.update',
            view: 'productCategories.view'
          }
        }),
      deps: [ProductCategoryService]
    }
  ],
  templateUrl: './product-category-form.dialog.html',
  styleUrl: './product-category-form.dialog.scss',
})
export class ProductCategoryFormDialog implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public facade: GenericCrudFormFacade<ProductCategory> = inject(GenericCrudFormFacade<ProductCategory>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  private dynamicDialogService: DynamicDialogService = inject(DynamicDialogService);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    parent_category_id: new FormControl<LookupItem | null>(null, []),
    applicability: ['', [Validators.required, Validators.maxLength(255)]],
    is_active: [true, []],
  });
  productApplicabilityOptions = ProductApplicabilityOptions;

  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);

  constructor() {
    const routeParam: string | null = this.activatedRoute.snapshot.paramMap.get('id');
    const routeId = routeParam === null ? Number.NaN : Number(routeParam);
    const dialogId = Number((this.dialogConfig?.data as { id?: number } | undefined)?.id);

    this.id.set(Number.isNaN(routeId) ? (Number.isNaN(dialogId) ? 0 : dialogId) : routeId);
    this.mode.set(this.routeUtilsService.getFormModeFromCurrentUrl());
  }

  async ngOnInit(): Promise<void> {
    await this.facade.init(this.mode(), this.form, this.id());
  }

  close(): void {
    this.dynamicDialogService.close();
  }

  onSubmit(): void {
    this.facade.submit(this.form, this.id()).subscribe({
      next: () => this.dialogRefreshService.notifySaved(),
    });
  }

  isInvalid(controlName: keyof FormType): boolean {
    return (this.form.get(controlName)?.invalid ?? false) && ((this.form.get(controlName)?.dirty ?? false) || (this.form.get(controlName)?.touched ?? false))
  }
}
