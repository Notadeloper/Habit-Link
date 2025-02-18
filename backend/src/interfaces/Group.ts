import { FrequencyPeriod } from "@prisma/client";

export interface CreateGroupRequestBody {
    name: string;
    description?: string;
    memberIds?: string[]; 

    habitTitle: string;
    frequency_count: number;
    frequency_period: "day" | "week" | "month";
    goalStreak?: number;
    dayStart: string;
}

export interface UpdateGroupRequestBody {
    name?: string;
    description?: string;
    habitTitle?: string;
    frequency_count?: number;
    frequency_period?: FrequencyPeriod;
    goalStreak?: number;
    dayStart?: string;
}