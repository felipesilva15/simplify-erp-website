import { RolePermissionResource } from "./role-permission-resource";

export interface RolePermission {
    id: number;
    name: string;
    resource: RolePermissionResource;
    action: string;
    description?: string;
}
