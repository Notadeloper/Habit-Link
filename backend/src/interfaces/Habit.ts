import { FrequencyPeriod } from "@prisma/client";

export interface CreateHabitRequestBody {
  title: string;
  description?: string;
  frequency_count: number;
  frequency_period: FrequencyPeriod; // e.g., "day", "week", etc.
  goalStreak?: number;
  groupId?: string;    // Optional: if provided, link this habit to a group.
}