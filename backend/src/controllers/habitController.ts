import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { CreateHabitRequestBody } from "../interfaces/Habit";

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
