export interface RegisterBody {
    username: string;
    email: string;
    last_name: string;
    first_name: string;
    password: string;
}

export interface UserRow {
    id: number,
    username: string,
    email: string
}