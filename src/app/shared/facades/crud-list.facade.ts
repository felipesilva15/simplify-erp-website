import { CrudPermissionDefinition } from './../../core/models/crud-permission-definition';
import { signal, computed, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { CrudService } from '../../core/contracts/crud-service';
import { PermissionService } from '../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../services/confirm-dialog-service';
import { ApiResponse } from '../../core/models/api-response';
import { BaseEntity } from '../../core/models/base-entity';

export class CrudListFacade<T extends BaseEntity> {
    private permissionService: PermissionService = inject(PermissionService);
    private confirmService: ConfirmDialogService = inject(ConfirmDialogService);

    private _response = signal<ApiResponse<T[]> | null>(null);
    private _data = signal<T[]>([]);
    private _loading = signal<boolean>(false);
    private _error = signal<string | null>(null);

    response = this._response.asReadonly();
    data = this._data.asReadonly();
    loading = this._loading.asReadonly();
    error = this._error.asReadonly();

    constructor(
        private service: CrudService<T>,
        private crudPermissionDefinition: CrudPermissionDefinition
    ) {}

    load(params?: any) {
        this._loading.set(true);

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

    async delete(entity: T) {
        if (!this.canDelete()) {
            return;
        }

        const confirmed = await this.confirmService.confirm({
            message: `Deseja realmente excluir o registro de ID ${entity.id} registro?`
        });

        if (!confirmed) {
            return;
        }

        this._loading.set(true);

        this.service.delete(entity.id)
            .pipe(
                finalize(() => this._loading.set(false))
            )
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