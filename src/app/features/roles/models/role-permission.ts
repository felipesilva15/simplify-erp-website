export interface RolePermission {
    id: number;
    name: string;
    resource: string;
    action: string;
    description?: string;
}
