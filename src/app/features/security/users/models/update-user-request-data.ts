import { OnlyId } from "../../../../core/models/only-id";

export interface UpdateUserRequestData {
    name: string;
    email: string;
    username: string;
    phone_number: string;
    is_admin: boolean;
    roles: OnlyId[];
}
