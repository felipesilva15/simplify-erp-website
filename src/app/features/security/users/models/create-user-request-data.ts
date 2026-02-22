import { OnlyId } from "../../../../core/models/only-id";

export interface CreateUserRequestData {
    name: string;
    email: string;
    password: string;
    username: string;
    phone_number: string;
    is_admin: boolean;
    roles: OnlyId[];
}
