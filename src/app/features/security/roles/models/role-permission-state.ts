import { Module } from './../../modules/models/module';
import { Role } from "./role";

export interface RolePermissionState {
    role: Role;
    modules: Module[];
}
