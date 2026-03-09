import { CrudPermissionDefinition } from './../../core/models/crud-permission-definition';
import { signal, computed, inject, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { CrudService } from '../../core/contracts/crud-service';
import { PermissionService } from '../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../services/confirm-dialog-service';
import { ApiResponse } from '../../core/models/api-response';
import { BaseEntity } from '../../core/models/base-entity';
import { ListRequestParams } from '../../core/models/list-request-params';

export class CrudListFacade<T extends BaseEntity> {
    private permissionService: PermissionService = inject(PermissionService);
    private confirmService: ConfirmDialogService = inject(ConfirmDialogService);

    private _response: WritableSignal<ApiResponse<T[]> | null> = signal<ApiResponse<T[]> | null>(null);
    private _data: WritableSignal<T[]> = signal<T[]>([]);
    private _loading: WritableSignal<boolean> = signal<boolean>(false);
    private _error: WritableSignal<string | null> = signal<string | null>(null);
    private _filterDefinitionVisible: WritableSignal<boolean> = signal<boolean>(false);
    private _requestParams: WritableSignal<ListRequestParams<T> | null> = signal<ListRequestParams<T> | null>(null);

    response = this._response.asReadonly();
    data = this._data.asReadonly();
    loading = this._loading.asReadonly();
    error = this._error.asReadonly();
    filterDefinitionVisible = this._filterDefinitionVisible.asReadonly();
    requestParams = this._requestParams.asReadonly();

    constructor(
        private service: CrudService<T>,
        private crudPermissionDefinition: CrudPermissionDefinition
    ) {}

    load(params?: any) {
        this._loading.set(true);
        this._data.set([]);
        this._response.set(null);

        this.service.list(params)
            .pipe(
                finalize(() => this._loading.set(false))
            )
            .subscribe({
                next: (res: ApiResponse<T[]>) => {
                    this._response.set(res);
                    this._data.set(res.data);
                },
                error: () => this._error.set('Erro ao carregar registros.')
            });
    }

    openFilters(): void {
        this._filterDefinitionVisible.set(true);
    }

    fitlersVisibleChange(visible: boolean): void {
        this._filterDefinitionVisible.set(visible);
    }

    applyFilters(filters: any) {
        console.log(filters);
        this.load();
    }

    async delete(entity: T) {
        if (!this.canDelete()) {
            return;
        }

        const confirmed = await this.confirmService.confirm({
            message: `Deseja realmente excluir o registro de ID ${entity.id}?`,
            acceptButtonProps: {
                severity: 'danger'
            }
        });

        if (!confirmed) {
            return;
        }

        this.service.delete(entity.id)
            .subscribe({
                next: () => {
                    this._data.update(list =>
                        list.filter(item => item['id'] !== entity.id)
                    );
                }
            });
    }

    can(permission?: string): boolean {
        if (!permission) {
            return true;
        }

        return this.permissionService.has(permission);
    }

    canCreate(): boolean { 
        return this.can(this.crudPermissionDefinition.create);
    }

    canUpdate(): boolean { 
        return this.can(this.crudPermissionDefinition.update);
    }

    canDelete(): boolean { 
        return this.can(this.crudPermissionDefinition.delete);
    }

    canView(): boolean { 
        return this.can(this.crudPermissionDefinition.view);
    }
}