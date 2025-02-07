export interface UpdateUserRequestBody {
    username: string;
    email: string;
    fullName: string;
    currentPassword: string;
    newPassword: string;
}
