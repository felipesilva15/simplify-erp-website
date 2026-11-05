import { BaseEntity } from "../../../../core/models/base-entity";
import { ModuleResource } from "./module-resource";

export interface Module extends BaseEntity{
    name: string;
    description: string;
    slug: string;
    is_active: boolean;
    resources: ModuleResource[];
}
