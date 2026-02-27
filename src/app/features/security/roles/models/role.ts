import { BaseEntity } from "../../../../core/models/base-entity";
import { RolePermission } from "./role-permission";

export interface Role extends BaseEntity {
    id: number;
    name: string;
    description?: string;
    permissions: RolePermission[];
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
