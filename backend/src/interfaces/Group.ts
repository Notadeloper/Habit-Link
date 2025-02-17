export interface CreateGroupRequestBody {
    name: string;
    description?: string;
    memberIds?: string[]; // Optional array of user IDs to be added as members.
}

export interface GroupUpdateData {
    name?: string;
    description?: string;
}