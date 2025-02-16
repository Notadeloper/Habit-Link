import { FrequencyPeriod } from "@prisma/client";

export interface CreateHabitRequestBody {
  title: string;
  description?: string;
  frequency_count: number;
  frequency_period: FrequencyPeriod;
  goalStreak?: number;
  groupId?: string; 
}
export interface CreateHabitTrackingRequestBody {
    habitId: string; 
    date: string
    notes?: string;
}

export interface UpdateHabitRequestBody {
    title?: string;
    description?: string;
    frequency_count?: number;
    frequency_period?: FrequencyPeriod;
    goalStreak?: number;
}