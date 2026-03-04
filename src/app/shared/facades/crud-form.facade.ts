import { ToastService } from './../services/toast-service';
import { computed, effect, inject, Signal, signal, WritableSignal } from "@angular/core";
import { BaseEntity } from "../../core/models/base-entity";
import { FormMode } from "../../core/enums/form-mode";
import { CrudService } from "../../core/contracts/crud-service";
import { CrudFormConfig } from "../../core/models/crud-form-config";
import { FormGroup } from "@angular/forms";
import { PermissionService } from "../../core/auth/services/permission-service";
import { finalize, Observable, tap } from "rxjs";
import { ApiResponse } from "../../core/models/api-response";
import { ConfirmDialogService } from "../services/confirm-dialog-service";
import { Location } from "@angular/common";

export class CrudFormFacade<T extends BaseEntity> {
    private permissionService: PermissionService = inject(PermissionService);
    private confirmDialogService: ConfirmDialogService = inject(ConfirmDialogService);
    private toastService: ToastService = inject(ToastService);
    private location: Location = inject(Location);

    private _mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.CREATE);
    private _entity: WritableSignal<T | null> = signal<T | null>(null);
    private _entityResponse: WritableSignal<ApiResponse<T> | null> = signal<ApiResponse<T> | null>(null)
    private _loading: WritableSignal<boolean> = signal<boolean>(false);
    private _saving: WritableSignal<boolean> = signal<boolean>(false);
    private _error: WritableSignal<string | null> = signal<string | null>(null);

    mode: Signal<FormMode> = this._mode.asReadonly();
    entity: Signal<T | null> = this._entity.asReadonly();
    entityResponse: Signal<ApiResponse<T> | null> = this._entityResponse.asReadonly();
    loading: Signal<boolean> = this._loading.asReadonly();
    saving: Signal<boolean> = this._saving.asReadonly();
    error: Signal<string | null> = this._error.asReadonly();

    isCreate: Signal<boolean> = computed(() => this._mode() === FormMode.CREATE);
    isEdit: Signal<boolean> = computed(() => this._mode() === FormMode.EDIT);
    isView: Signal<boolean> = computed(() => this._mode() === FormMode.VIEW);
    hasWarnings: Signal<boolean> = computed(() => (this.entityResponse()?.warnings?.length ?? 0) > 0);

    constructor(
        private service: CrudService<T>,
        private config?: CrudFormConfig<T>
    ) {}

    init(mode: FormMode, form: FormGroup, id?: number): void {
        this._mode.set(mode);

        if (!this.hasPermission(mode)) {
        throw new Error('Sem permissão');
        }

        effect(() => {
            if (this.isView() || (this.isEdit() && this._entityResponse() && this.entityResponse()?.meta && !this.entityResponse()?.meta?.editable )) {
                form.disable();
            }
        });

        if ((mode === FormMode.EDIT || mode === FormMode.VIEW) && id) {
            this.load(id, form);
        }
    }

    private hasPermission(mode: FormMode): boolean {
        if (!this.config?.permission) {
            return true;
        }

        let permission: string = '';

        switch (this.mode()) {
            case FormMode.CREATE:
                permission = this.config?.permission?.create ?? ''
                break;

            case FormMode.EDIT:
                permission = this.config?.permission?.update ?? ''
                break;

            case FormMode.VIEW:
                permission = this.config?.permission?.view ?? ''
                break;
        }

        return this.permissionService.has(permission);
    }

    private load(id: number, form: FormGroup): void {
        this._loading.set(true);

        const request$: Observable<ApiResponse<T>> = this.isView() ? this.service.get(id) : this.service.edit(id);

        request$
            .pipe(
                finalize(() => this._loading.set(false))
            )
            .subscribe({
                next: (res: ApiResponse<T>) => {
                    this._entityResponse.set(res);
                    this._entity.set(res.data);

                    form.patchValue(res.data);
                },
                error: () => this._error.set('Erro ao carregar registro')
            });
    }

    submit(form: FormGroup, id?: number): Observable<ApiResponse<T>> {
        form.markAllAsTouched();

        if (form.invalid) {
            this.scrollTop();
            throw new Error('Formulário inválido!');
        };

        if (this.config?.validSubmit && !this.config.validSubmit()) {
            throw new Error('Envio não é válido!');
        }

        this._saving.set(true);

        let payload = form.getRawValue();

        if (this.config?.beforeSubmit) {
            payload = this.config.beforeSubmit(payload);
        }

        const request$ = this.isCreate() ? this.service.create(payload) : this.service.update(id!, payload);

        return request$.pipe(
            tap((res: ApiResponse<T>) => {
                this._entity.set(res.data);

                this.config?.afterSubmit?.(res.data);

                if (this.config?.successMessage) {
                    this.toastService.show({
                        title: 'Sucesso',
                        message: this.config.successMessage,
                        severity: 'success'
                    })
                }

                if (this.config?.navigateAfterSave) {
                    this.config.navigateAfterSave(res.data);
                }
                else {
                    this.navigateBack();
                }

                form.markAsPristine();
            }),
            finalize(() => this._saving.set(false))
        );
    }

    scrollTop(): void {
        window.scroll({ 
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
        });
    }

    navigateBack(form?: FormGroup): void {
        if (!form) {
            this.location.back();
            return;
        }

        this.canDeactivate(form).then(
            (confirmed: boolean) => confirmed && this.location.back()
        )
    }

    async canDeactivate(form?: FormGroup): Promise<boolean> {
        if (!form || !form.dirty || this.isView()) {
            return true;
        }

        return this.confirmDialogService.confirm({
            message: 'Existem alterações não salvas. Deseja mesmo sair?'
        });
    }
}
