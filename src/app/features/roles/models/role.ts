import { RolePermission } from "./role-permission";

export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions: RolePermission[];
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
