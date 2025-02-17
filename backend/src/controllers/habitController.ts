import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { CreateHabitRequestBody, CreateHabitTrackingRequestBody, UpdateHabitRequestBody, UpdateHabitTrackingRequestBody } from "../interfaces/Habit";
import { format, startOfWeek, differenceInCalendarDays, differenceInCalendarWeeks, differenceInCalendarMonths, addDays } from 'date-fns';

export const createHabit: RequestHandler = async (req, res) => {
    try {
        const creatorId = req.user?.id;
        const { title, description, frequency_count, frequency_period, goalStreak, groupId } = req.body as CreateHabitRequestBody;

        if (!creatorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!title || !frequency_count || !frequency_period) {
            res.status(400).json({ error: "Missing required fields: title, frequency_count, and frequency_period are required" });
            return;
        }

        const count = Number(frequency_count);
        const goal = goalStreak !== undefined ? Number(goalStreak) : undefined;

        const newHabit = await prisma.habit.create({
            data: {
                user: { connect: { id: creatorId } },
                title,
                description,
                frequency_count: count,
                frequency_period,
                goalStreak: goal,
                ...(groupId? {
                        habitGroups: {
                            create: {
                                group: { connect: { id: groupId } },
                            },
                        },
                    }
                    : {}),
                },
            include: {
                habitGroups: {
                    include: { group: true },
                },
            },
        });

        res.status(201).json({ habit: newHabit });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in createHabit controller", error.message);
        } else {
            console.log("Unexpected error in createHabit controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getHabitsForUser: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const habits = await prisma.habit.findMany({
            where: { user_id: userId },
            orderBy: { updated_at: 'desc' },
            include: {
                streaks: true,
                habitGroups: {
                    include: { group: true },
                },
            },
        });

        if (!habits) {
            res.status(404).json({ error: 'No habits found for this user' });
            return;
        }

        res.status(200).json({ habits });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitsForUser controller", error.message);
        } else {
            console.log("Unexpected error in getHabitsForUser controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getHabitDetails: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { habitId } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const habit = await prisma.habit.findUnique({
            where: {
                id: habitId,
                user_id: userId,
            },
            include: {
                habitTrackings: {
                    orderBy: { date: "desc" },
                },
                streaks: true,
                habitGroups: {
                    include: { group: true },
                },
            },
        });

        if (!habit) {
            res.status(404).json({ error: 'No habits found for this user' });
            return;
        }

        res.status(200).json({ habit });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        } else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateHabit: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { habitId } = req.params;
        const { title, description, frequency_count, frequency_period, goalStreak } = req.body as UpdateHabitRequestBody;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }

        const habit = await prisma.habit.findUnique({
            where: { id: habitId, user_id: userId },
          });

        if (!habit) {
            res.status(404).json({ error: 'This habit was not found for this user' });
            return;
        }

        const updateData: Partial<UpdateHabitRequestBody> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (frequency_count !== undefined) updateData.frequency_count = Number(frequency_count);
        if (frequency_period !== undefined) updateData.frequency_period = frequency_period;
        if (goalStreak !== undefined) updateData.goalStreak = Number(goalStreak);
    
        const updatedHabit = await prisma.habit.update({
            where: { id: habitId },
            data: updateData,
        });

        if (!updatedHabit) {
            res.status(404).json({ error: 'The habit was not successfully updated' });
            return;
        }

        recalculateStreaks(habitId, userId, updatedHabit.frequency_count, updatedHabit.frequency_period, user.dayStart);
    
        res.status(200).json({ updatedHabit });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        } else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteHabit: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { habitId } = req.params;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const habit = await prisma.habit.findUnique({
            where: {
                id: habitId,
            },
        });

        if (!habit) {
            res.status(404).json({ error: 'No habits found for this user' });
            return;
        }

        if (habit.user_id !== userId) {
            res.status(404).json({ error: 'Not authorized to delete this habit' });
            return;
        }

        await prisma.habit.delete({
            where: {
                id: habitId,
            },
        });

        res.status(200).json({ message: "Habit deleted successfully" });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        } else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const createHabitTracking: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }

        const { habitId, date, notes } = req.body as CreateHabitTrackingRequestBody;

        if (!habitId || !date) {
            res.status(400).json({ error: "Missing required fields: habit_id and date are required" });
            return;
        }

        const trackingDate = new Date(date);
        if (isNaN(trackingDate.getTime())) {
            res.status(400).json({ error: "Invalid date format" });
            return;
        }

        const habit = await prisma.habit.findUnique({
            where: {
                id: habitId,
                user_id: userId
            },
        });

        if (!habit) {
            res.status(404).json({ error: 'This habit was not found for this user' });
            return;
        }

        const newTracking = await prisma.habitTracking.create({
            data: {
                habit: { connect: { id: habitId } },
                user: { connect: { id: userId } },
                date: trackingDate,
                notes,
            },
        });

        recalculateStreaks(habitId, user.id, habit.frequency_count, habit.frequency_period, user.dayStart);

        res.status(201).json({ habitTracking: newTracking });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        } else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const updateHabitTracking: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { trackingId } = req.params;
        const { date, notes } = req.body as UpdateHabitTrackingRequestBody;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }

        const trackingEntry = await prisma.habitTracking.findUnique({
            where: { id: trackingId },
            include: { habit: true },
        });
      

        if (!trackingEntry || trackingEntry.user_id !== userId) {
           res.status(404).json({ error: "Tracking entry not found" });
           return;
        }

        const updatedTracking = await prisma.habitTracking.update({
            where: { id: trackingId },
            data: {
                date: date ? new Date(date) : trackingEntry.date,
                notes: notes !== undefined ? notes : trackingEntry.notes,
            },
        });

        const habit = trackingEntry.habit;

        recalculateStreaks(habit.id, userId, habit.frequency_count, habit.frequency_period, user.dayStart);
    
        res.status(200).json({ updatedTracking });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        } else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const deleteHabitTracking: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { trackingId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }

        const trackingEntry = await prisma.habitTracking.findUnique({
            where: { id: trackingId },
            include: { habit: true },
        });
      
        if (!trackingEntry || trackingEntry.user_id !== userId) {
           res.status(404).json({ error: "Tracking entry not found" });
           return;
        }

        const habit = trackingEntry.habit;

        await prisma.habitTracking.delete({
            where: { id: trackingId }
        })

        recalculateStreaks(habit.id, userId, habit.frequency_count, habit.frequency_period, user.dayStart);
    
        res.status(200).json({ message: "Habit tracking deleted successfully" });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        } else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}


// All done in UTC
export const recalculateStreaks = async (habitId: string, userId: string, frequency_count: number, frequency_period: "day" | "week" | "month", dayStart: string) => {
    try {
        const trackingEntries = await prisma.habitTracking.findMany({
            where: {
                habit_id: habitId,
                user_id: userId,
            },
            orderBy: {
                date: 'desc',
            },
        });


        // Counts num entries per defined period
        const periodCounts: Map<string, { count: number; date: Date }> = new Map();
        for (const entry of trackingEntries) {
            const entryDate = new Date(entry.date);
            const key = getPeriodKey(entryDate, frequency_period as "day" | "week" | "month", dayStart);
            console.log(key, entryDate);
            if (periodCounts.has(key)) {
                periodCounts.get(key)!.count++;
            } else {
                periodCounts.set(key, { count: 1, date: entryDate });
            }
        }

        // Find periods that can count towards the streak
        const qualifyingPeriods = Array.from(periodCounts.entries())
            .filter(([_, { count }]) => count >= frequency_count)
            .map(([key, obj]) => ({ key, date: obj.date }));

        // Sort these valid periods by date
        qualifyingPeriods.sort((a, b) => b.date.getTime() - a.date.getTime());

        console.log("qualifyingPeriods", qualifyingPeriods)

        const currentPeriodKey = getPeriodKey(new Date(), frequency_period, dayStart);
        let currentStreak = 0;
        if (qualifyingPeriods.length > 0 && qualifyingPeriods[0].key === currentPeriodKey) {
            currentStreak = 1;
            for (let i = 1; i < qualifyingPeriods.length; i++) {
                if (isConsecutive(qualifyingPeriods[i - 1].key, qualifyingPeriods[i].key, frequency_period)) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        } else {
            currentStreak = 0;
        }
      
        let maxStreak = 0;
        if (qualifyingPeriods.length > 0) {
            let tempStreak = 1;
            maxStreak = 1;
            for (let i = 1; i < qualifyingPeriods.length; i++) {
                if (isConsecutive(qualifyingPeriods[i - 1].key, qualifyingPeriods[i].key, frequency_period)) {
                    tempStreak++;
                } else {
                    maxStreak = Math.max(maxStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            maxStreak = Math.max(maxStreak, tempStreak);
        }

        console.log("Recalculated streaks", currentStreak, maxStreak);

        await prisma.streak.upsert({
            where: {
                habit_id_user_id: { habit_id: habitId, user_id: userId },
            },
            update: {
                current_streak: currentStreak,
                max_streak: maxStreak,
                last_updated: new Date(),
            },
            create: {
                habit: { connect: { id: habitId } },
                user: { connect: { id: userId } },
                current_streak: currentStreak,
                max_streak: maxStreak,
                last_updated: new Date(),
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in streak recalculation", error.message);
        } else {
            console.log("Unexpected error in streak recalculation", error);
        }     
        throw error;
    }
}

function adjustToUserDay(date: Date, dayStart: string): Date {
    const [hour, minute] = dayStart.split(":").map(Number);
    const adjusted = new Date(date);
    // Set the date's time to the user's day start.
    adjusted.setUTCHours(hour, minute, 0, 0);
    // If the original date is before the adjusted time, it belongs to the previous day.
    console.log(date.getTime(), adjusted.getTime());
    if (date.getTime() <= adjusted.getTime()) {
        return addDays(adjusted, -1);
    }
    return adjusted;
}


function getPeriodKey(date: Date, frequency_period: "day" | "week" | "month", dayStart: string): string {
    try {
        if (frequency_period === "day") {
            const adjustedDate = adjustToUserDay(date, dayStart);
            return format(adjustedDate, "yyyy-MM-dd");
        } else if (frequency_period === "week") {
            // Adjust the date first
            const adjustedDate = adjustToUserDay(date, dayStart);
            // Get Monday as the start of the week (weekStartsOn: 1)
            const monday = startOfWeek(adjustedDate, { weekStartsOn: 1 });
            return format(monday, "yyyy-MM-dd");
        } else if (frequency_period === "month") {
            const adjustedDate = adjustToUserDay(date, dayStart);
            return format(adjustedDate, "yyyy-MM");
        }
        return "";
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getPeriodKey", error.message);
        } else {
            console.log("Unexpected error in getPeriodKey", error);
        }     
        throw error;
    }
  }

function isConsecutive(prevKey: string, currKey: string, frequency_period: "day" | "week" | "month"): boolean {
    try {
        if (frequency_period === "day") {
            const prevDate = new Date(prevKey);
            const currDate = new Date(currKey);
            return differenceInCalendarDays(prevDate, currDate) === 1;
        } else if (frequency_period === "week") {
            const prevDate = new Date(prevKey);
            const currDate = new Date(currKey);
            return differenceInCalendarWeeks(prevDate, currDate, { weekStartsOn: 1 }) === 1;
        } else if (frequency_period === "month") {
            const prevDate = new Date(prevKey);
            const currDate = new Date(currKey);
            return differenceInCalendarMonths(prevDate, currDate) === 1;
        }
        return false;
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in isConsecutive", error.message);
        } else {
            console.log("Unexpected error in isConsecutive", error);
        }     
        throw error;
    }
}