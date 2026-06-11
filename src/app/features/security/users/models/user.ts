import { Role } from "../../roles/models/role";

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    email_verified_at?: Date;
    phone_number: string;
    is_admin: boolean;
    permissions: string[];
    roles: Role[];
    avatar_url: string;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}
