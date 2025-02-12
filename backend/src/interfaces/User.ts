export interface UpdateUserRequestBody {
    username: string;
    email: string;
    fullName: string;
    currentPassword: string;
    newPassword: string;
}
export interface UserUpdateData {
    fullName?: string;
    email?: string;
    username?: string;
    password?: string;
}