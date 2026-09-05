import { LookupItem } from './../../core/models/lookup-item';
import { ToastService } from './../services/toast-service';
import { computed, effect, inject, Signal, signal, WritableSignal } from "@angular/core";
import { BaseEntity } from "../../core/models/base-entity";
import { FormMode } from "../../core/enums/form-mode";
import { CrudService } from "../../core/contracts/crud-service";
import { CrudFormConfig } from "../../core/models/crud-form-config";
import { FormGroup } from "@angular/forms";
import { PermissionService } from "../../core/auth/services/permission-service";
import { finalize, Observable, take, tap } from "rxjs";
import { ApiResponse } from "../../core/models/api-response";
import { ConfirmDialogService } from "../services/confirm-dialog-service";
import { KeyValue, Location } from "@angular/common";
import { ApiMetaOption } from '../../core/enums/api-meta-option';
import { ApiMetaType } from '../../core/types/api-meta-type';
import { FormPageFacade } from '../../core/contracts/form-page-facade';

export abstract class CrudFormFacade<T extends BaseEntity> implements FormPageFacade<T> {
    protected permissionService: PermissionService = inject(PermissionService);
    protected confirmDialogService: ConfirmDialogService = inject(ConfirmDialogService);
    protected toastService: ToastService = inject(ToastService);
    protected location: Location = inject(Location);

    protected _mode: WritableSignal<FormMode> = signal<FormMode>(FormMode.Create);
    protected _entity: WritableSignal<T | null> = signal<T | null>(null);
    protected _meta: WritableSignal<ApiMetaType | null> = signal<ApiMetaType | null>(null);
    protected _warnings: WritableSignal<string[]> = signal<string[]>([]);
    protected _loading: WritableSignal<boolean> = signal<boolean>(false);
    protected _saving: WritableSignal<boolean> = signal<boolean>(false);
    protected _error: WritableSignal<string | null> = signal<string | null>(null);
    protected _serverErrors: WritableSignal<KeyValue<string, string>[]> = signal<KeyValue<string, string>[]>([])

    mode: Signal<FormMode> = this._mode.asReadonly();
    entity: Signal<T | null> = this._entity.asReadonly();
    meta: Signal<ApiMetaType | null> = this._meta.asReadonly();
    warnings: Signal<string[]> = this._warnings.asReadonly();
    loading: Signal<boolean> = this._loading.asReadonly();
    saving: Signal<boolean> = this._saving.asReadonly();
    error: Signal<string | null> = this._error.asReadonly();
    serverErrors: Signal<KeyValue<string, string>[]> = this._serverErrors.asReadonly();

    isCreate: Signal<boolean> = computed(() => this._mode() === FormMode.Create);
    isEdit: Signal<boolean> = computed(() => this._mode() === FormMode.Edit);
    isView: Signal<boolean> = computed(() => this._mode() === FormMode.View);
    hasWarnings: Signal<boolean> = computed(() => this.warnings().length > 0);
    hasServerErrors: Signal<boolean> = computed(() => this.serverErrors().length > 0);

    constructor(
        protected service: CrudService<T>,
        protected config?: CrudFormConfig<T>
    ) {}

    init(mode: FormMode, form: FormGroup, id?: number): void {
        this._mode.set(mode);

        if (!this.hasPermission()) {
            throw new Error('Sem permissão para a ação.');
        }

        effect(() => {
            if (this.isView() || (this.isEdit() && this.meta() && !this.meta()?.[ApiMetaOption.Editable] )) {
                form.disable();
            }
        });

        if ((mode === FormMode.Edit || mode === FormMode.View) && id) {
            this.load(id, form);
        }
    }

    protected load(id: number, form: FormGroup): void {
        this._loading.set(true);

        this.fetchData(id)
            .pipe(
                finalize(() => this._loading.set(false))
            )
            .subscribe({
                next: (res: ApiResponse<T>) => {
                    this._meta.set(res.meta ?? null);
                    this._warnings.set(res.warnings ?? []);
                    this._entity.set(res.data);

                    this.applyLoadedData(res.data, form);
                },
                error: () => this._error.set('Erro ao carregar registro')
            });
    }

    submit(form: FormGroup, id?: number): Observable<ApiResponse<T>> {
        form.markAllAsTouched();
        
        this.unsetServerErrors(form);

        if (form.invalid) {
            this.scrollTop();
            throw new Error('Formulário inválido!');
        };

        if (this.config?.validSubmit && !this.config.validSubmit()) {
            throw new Error('Envio não é válido!');
        }

        this._saving.set(true);

        const payload = this.buildPayload(form);

        return this.persist(id, payload).pipe(
            tap({
                next: (res: ApiResponse<T>) => {
                    this._meta.set(res.meta ?? null);
                    this._warnings.set(res.warnings ?? []);
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
                },
                error: (err: { error?: unknown }) => {
                    if (err.error) {
                        this.applyServerErrors(form, err.error as ApiResponse<undefined>);
                        this.scrollTop();
                    }
                }
            }),
            finalize(() => this._saving.set(false))
        );
    }

    // hooks
    protected abstract fetchData(id: number): Observable<ApiResponse<T>>;
    protected abstract applyLoadedData(data: T, form: FormGroup): void;
    protected abstract buildPayload(form: FormGroup): Partial<T>;
    protected abstract persist(id: number | undefined, payload: Partial<T>): Observable<ApiResponse<T>>;

    private hasPermission(): boolean {
        if (!this.config?.permission) {
            return true;
        }

        let permission = '';

        switch (this.mode()) {
            case FormMode.Create:
                permission = this.config?.permission?.create ?? ''
                break;

            case FormMode.Edit:
                permission = this.config?.permission?.update ?? ''
                break;

            case FormMode.View:
                permission = this.config?.permission?.view ?? ''
                break;
        }

        return this.permissionService.has(permission);
    }

    scrollTop(): void {
        window.scroll({ 
            top: 0, 
            left: 0, 
            behavior: 'smooth' 
        });
    }

    protected unwrapLookups(payload: Record<string, unknown>): Record<string, unknown> {
        return Object.fromEntries(
            Object.entries(payload).map(([key, value]) => {
                if (this.isLookupItem(value)) {
                    return [key, (value as LookupItem).meta ?? null];
                }

                if (Array.isArray(value) && value.every(this.isLookupItem)) {
                    return [key, value.map((item: LookupItem) => item.meta ?? null)];
                }

                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    return [key, this.unwrapLookups(value as Record<string, unknown>)];
                }

                return [key, value];
            })
        );
    }

    protected isLookupItem(value: unknown): boolean {
        return (
            typeof value === 'object' &&
            value !== null &&
            'key' in value &&
            'label' in value &&
            'meta' in value
        );
    }

    applyServerErrors(form: FormGroup, response: ApiResponse<undefined>): void {
        const serverErrors: KeyValue<string, string>[] = [];

        if (response.errors) {
            Object.entries(response.errors).forEach(([path, messages]) => {
                const control = form.get(this.toControlPath(path));
                if (control) {
                    control.setErrors({ ...control.errors, server: messages });
                    control.markAsTouched();

                    control.valueChanges.pipe(take(1)).subscribe(() => {
                        const { _server, ...rest } = control.errors ?? {};
                        control.setErrors(Object.keys(rest).length ? rest : null);
                    });
                } else {
                   serverErrors.push({key: path, value: messages[0]});
                }
            });
        }

        if (!response.success && response.message && !response.errors) {
            serverErrors.push({key: 'server', value: response.message});
        }

        this._serverErrors.set(serverErrors);
    }

    private toControlPath(path: string): string {
        return path;
    }

    unsetServerErrors(form: FormGroup): void {
        this._serverErrors.set([]);
        Object.keys(form.controls).forEach(key => {
            const control = form.get(key);

            if (control) {
                const currentErrors = { ...control?.errors };
                delete currentErrors['server'];

                control.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
            }
        });
    }

    navigateBack(form?: FormGroup): void {
        if (!form) {
            this.location.back();
            return;
        }

        void this.canDeactivate(form).then(
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