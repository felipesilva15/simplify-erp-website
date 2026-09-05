import { forkJoin, map, Observable } from "rxjs";
import { inject } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ApiResponse } from "../../../../core/models/api-response";
import { CrudFormConfig } from "../../../../core/models/crud-form-config";
import { CrudService } from "../../../../core/contracts/crud-service";
import { ListRequestParams } from "../../../../core/models/list-request-params";
import { FormMode } from "../../../../core/enums/form-mode";
import { CrudFormFacade } from "../../../../shared/facades/crud-form.facade";
import { ModuleService } from "../../../configuration/modules/services/module-service";
import { Role } from "../models/role";
import { RolePermissionState } from "../models/role-permission-state";
import { RoleService } from "../services/role-service";
import { RolePermissionsPayload } from "../models/role-permissions-payload";

export class RolePermissionFormFacade extends CrudFormFacade<Role, RolePermissionState, RolePermissionsPayload> {
    private roleService: RoleService = inject(RoleService);
    private moduleService: ModuleService = inject(ModuleService);

    constructor(
        service: CrudService<Role>,
        config?: CrudFormConfig<Role>
    ) {
        super(service, config);
    }

    protected override permission(): string {
        return this.config?.permission?.action ?? 'roles.definePermissions';
    }

    protected override loadsOnInit(_mode: FormMode, id?: number): boolean {
        return id != null;
    }

    protected override fetchData(id: number): Observable<ApiResponse<RolePermissionState>> {
        const params: ListRequestParams = {
            filters: {
                is_active: {
                    eq: 1
                }
            },
            page: 1,
            per_page: 100
        };

        return forkJoin({
            role: this.service.get(id),
            modules: this.moduleService.list(params),
        }).pipe(
            map(({ role, modules }) => ({
                success: role.success,
                message: role.message,
                warnings: role.warnings,
                links: role.links,
                errors: role.errors,
                meta: role.meta,
                data: {
                    role: role.data,
                    modules: modules.data,
                } satisfies RolePermissionState,
            }))
        );
    }

    protected override toEntity(state: RolePermissionState): Role {
        return state.role;
    }

    protected override applyLoadedData(state: RolePermissionState, form: FormGroup): void {
        const ids: number[] = (state.role.permissions ?? []).map(permission => permission.id);
        form.patchValue({ ids });
    }

    protected override buildPayload(form: FormGroup): RolePermissionsPayload {
        const raw = form.getRawValue() as { ids?: unknown };
        const ids: number[] = Array.isArray(raw.ids)
            ? raw.ids.map(id => Number(id)).filter(id => !Number.isNaN(id))
            : [];

        return { ids };
    }

    protected override persist(id: number | undefined, payload: RolePermissionsPayload): Observable<ApiResponse<Role>> {
        return this.roleService.definePermissions(id ?? 0, payload);
    }
}