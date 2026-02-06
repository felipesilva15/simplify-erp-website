export interface User {
    id: number,
    name: string,
    username: string,
    email: string,
    phone_number: string,
    is_admin: boolean,
    permissions: string[]
}
