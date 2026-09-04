import { ModuleResourcePermission } from "./module-resource-permission";

export interface ModuleResource {
    id: number;
    name: string;
    descriptions: string;
    slug: string;
    permissions: ModuleResourcePermission[];
}
