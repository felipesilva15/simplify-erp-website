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
import { MeasurementUnit } from '../../models/measurement-unit';
import { MeasurementUnitService } from '../../services/measurement-unit-service';
import { MeasurementUnitLookupComponent } from '../../components/measurement-unit-lookup/measurement-unit-lookup.component';
import { LookupItem } from '../../../../../core/models/lookup-item';
import { MeasurementUnitCategoryOptions } from '../../enums/measurement-unit-category';
import { SelectModule } from 'primeng/select';

interface FormType {
  code: FormControl<string>;
  name: FormControl<string>;
  category: FormControl<string>;
  symbol: FormControl<string>;
  base_unit_id: FormControl<LookupItem | null>;
  conversion_factor: FormControl<number>;
  decimal_places: FormControl<number>;
  external_code: FormControl<string>;
}

@Component({
  selector: 'app-measurement-unit-form',
  imports: [
    MessageModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToggleSwitchModule,
    MeasurementUnitLookupComponent,
    FormDialogUi,
    FluidModule,
    FormControlErrorsComponent,
    SkeletonModule,
    ButtonModule,
    AppTemplate
  ],
  providers: [
    {
      provide: GenericCrudFormFacade<MeasurementUnit>,
      useFactory: (service: MeasurementUnitService) =>
        new GenericCrudFormFacade<MeasurementUnit>(service, {
          successMessage: 'Registro salvo!',
          permission: {
            create: 'measurementUnits.create',
            update: 'measurementUnits.update',
            view: 'measurementUnits.view'
          }
        }),
      deps: [MeasurementUnitService]
    }
  ],
  templateUrl: './measurement-unit-form.dialog.html',
  styleUrl: './measurement-unit-form.dialog.scss',
})
export class MeasurementUnitFormDialog implements OnInit {
  private fb: FormBuilder = inject(FormBuilder)
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  public facade: GenericCrudFormFacade<MeasurementUnit> = inject(GenericCrudFormFacade<MeasurementUnit>);
  private routeUtilsService: RouteUtilsService = inject(RouteUtilsService);
  private dialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  private dynamicDialogService: DynamicDialogService = inject(DynamicDialogService);
  private dialogRefreshService: DialogRefreshService = inject(DialogRefreshService);

  breadcrumbItems!: MenuItem[];
  form: FormGroup<FormType> = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(10)]],
    name: ['', [Validators.required, Validators.maxLength(60)]],
    symbol: ['', [Validators.required, Validators.maxLength(10)]],
    category: ['', [Validators.required]],
    base_unit_id: new FormControl<LookupItem | null>(null, []),
    conversion_factor: [1, [Validators.min(0), Validators.max(10000000000)]],
    decimal_places: [0, [Validators.min(0), Validators.max(8)]],
    external_code: ['', [Validators.maxLength(10)]]
  });
  measurementUnitCategoryOptions = MeasurementUnitCategoryOptions;

  id: WritableSignal<number> = signal<number>(0);
  mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
  loading: WritableSignal<boolean> = signal<boolean>(true);

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
