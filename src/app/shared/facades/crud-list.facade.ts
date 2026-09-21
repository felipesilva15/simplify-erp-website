import { CrudPermissionDefinition } from './../../core/models/crud-permission-definition';
import { signal, inject, WritableSignal } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { CrudService } from '../../core/contracts/crud-service';
import { PermissionService } from '../../core/auth/services/permission-service';
import { ConfirmDialogService } from '../services/confirm-dialog-service';
import { ApiResponse } from '../../core/models/api-response';
import { BaseEntity } from '../../core/models/base-entity';
import { ListRequestParams } from '../../core/models/list-request-params';
import { RequestFiltersType } from '../../core/types/request-filters-type';
import { ApiMetaOption } from '../../core/enums/api-meta-option';
import { ExportableService } from '../../core/contracts/exportable-service';
import { ExportExtension } from '../../core/enums/export-extension';
import { ExportFormat } from '../../core/enums/export-format';
import { ExportMenuItem } from '../../core/models/export-menu-item';
import { ExportRequestParams } from '../../core/models/export-request-params';

export interface CrudListFacadeConfig {
    exportMenu?: ExportMenuItem[];
}

export class CrudListFacade<T extends BaseEntity> {
    private permissionService: PermissionService = inject(PermissionService);
    private confirmService: ConfirmDialogService = inject(ConfirmDialogService);

    private _response: WritableSignal<ApiResponse<T[]> | null> = signal<ApiResponse<T[]> | null>(null);
    private _data: WritableSignal<T[]> = signal<T[]>([]);
    private _loading: WritableSignal<boolean> = signal<boolean>(false);
    private _error: WritableSignal<string | null> = signal<string | null>(null);
    private _filterDefinitionVisible: WritableSignal<boolean> = signal<boolean>(false);
    private _requestParams: WritableSignal<ListRequestParams | undefined> = signal<ListRequestParams | undefined>(undefined);
    private _totalRecords: WritableSignal<number> = signal<number>(0);
    private _exportMenu: WritableSignal<ExportMenuItem[]> = signal<ExportMenuItem[]>([]);

    response = this._response.asReadonly();
    data = this._data.asReadonly();
    loading = this._loading.asReadonly();
    error = this._error.asReadonly();
    filterDefinitionVisible = this._filterDefinitionVisible.asReadonly();
    requestParams = this._requestParams.asReadonly();
    totalRecords = this._totalRecords.asReadonly();
    exportMenu = this._exportMenu.asReadonly();

    constructor(
        private service: CrudService<T>,
        private crudPermissionDefinition: CrudPermissionDefinition,
        private config: CrudListFacadeConfig = {}
    ) {
        this._exportMenu.set(config.exportMenu ?? []);
    }

    load(): void {
        this._loading.set(true);
        this._data.set([]);
        this._response.set(null);

        this.service.list(this._requestParams())
            .pipe(
                finalize(() => this._loading.set(false))
            )
            .subscribe({
                next: (res: ApiResponse<T[]>) => {
                    this._response.set(res);
                    this._data.set(res.data);
                    this._totalRecords.set(res.meta?.[ApiMetaOption.Total] ?? res.data.length);
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

    applyFilters(filters: RequestFiltersType | undefined): void {
        this._requestParams.update((p: ListRequestParams | undefined) => {
            if (!p) {
                p = {};
            }

            if (filters) {
                p.filters = filters;
            } else {
                delete p.filters;
            }

            p.page = 1;
            
            return p; 
        })
        this.load();
    }

    applyLazyLoad(page: number, per_page: number, sorts: string | undefined): void {
        this._requestParams.update(p => ({
            ...(p ?? {}),
            page,
            per_page,
            sorts,
        }));
        this.load();
    }

    async delete(entity: T): Promise<void> {
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

    export(format: ExportFormat, extension: ExportExtension): void {
        const exportable = this.service as Partial<ExportableService>;
        const exportFn = exportable.export?.bind(exportable);

        if (typeof exportFn !== 'function') {
            this._error.set('Exportação não disponível para este recurso.');
            return;
        }

        this.exportCustom(format, extension, params => exportFn(params));
    }

    exportCustom(format: ExportFormat, extension: ExportExtension, handler: (params: ExportRequestParams) => Observable<Blob>): void {
        const params: ExportRequestParams = {
            ...(this._requestParams() ?? {}),
            format,
            extension,
        };

        handler(params).subscribe({
            next: (blob: Blob) => this.downloadBlob(blob, extension),
            error: () => this._error.set('Erro ao exportar dados.')
        });
    }

    private downloadBlob(blob: Blob, extension: ExportExtension): void {
        if (typeof document === 'undefined') {
            return;
        }

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
        const fileName = `export_${timestamp}.${extension}`;
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    }
}