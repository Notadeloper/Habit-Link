export interface SignupRequestBody {
    username: string;
    email: string;
    fullName: string;
    password: string;
}

export interface LoginRequestBody {
    usernameOrEmail: string;
    password: string;
}