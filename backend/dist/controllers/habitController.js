"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateStreaks = exports.deleteHabitTracking = exports.updateHabitTracking = exports.createHabitTracking = exports.deleteHabit = exports.updateHabit = exports.getHabitDetails = exports.getHabitsForUser = exports.createHabit = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const date_fns_1 = require("date-fns");
const createHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const creatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { title, description, frequency_count, frequency_period, goalStreak } = req.body;
        if (!creatorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!title || !frequency_count || !frequency_period) {
            res.status(400).json({ error: "Missing required fields: title, frequency_count, frequency_period and habit are required" });
            return;
        }
        const count = Number(frequency_count);
        const goal = goalStreak !== undefined ? Number(goalStreak) : undefined;
        const newHabit = yield prismaClient_1.default.habit.create({
            data: {
                user: { connect: { id: creatorId } },
                title,
                description,
                frequency_count: count,
                frequency_period,
                goalStreak: goal
            }
        });
        res.status(201).json({ habit: newHabit });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in createHabit controller", error.message);
        }
        else {
            console.log("Unexpected error in createHabit controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createHabit = createHabit;
const getHabitsForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const habits = yield prismaClient_1.default.habit.findMany({
            where: { user_id: userId },
            orderBy: { updated_at: 'desc' },
            include: {
                streak: true,
            },
        });
        if (!habits) {
            res.status(404).json({ error: 'No habits found for this user' });
            return;
        }
        res.status(200).json({ habits });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitsForUser controller", error.message);
        }
        else {
            console.log("Unexpected error in getHabitsForUser controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getHabitsForUser = getHabitsForUser;
const getHabitDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { habitId } = req.params;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const habit = yield prismaClient_1.default.habit.findUnique({
            where: {
                id: habitId,
                user_id: userId,
            },
            include: {
                habitTrackings: {
                    orderBy: { date: "desc" },
                },
                streak: true,
                HabitParticipation: {
                    include: {
                        groupHabit: {
                            include: {
                                group: true
                            }
                        }
                    },
                },
            },
        });
        if (!habit) {
            res.status(404).json({ error: 'No habits found for this user' });
            return;
        }
        res.status(200).json({ habit });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        }
        else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getHabitDetails = getHabitDetails;
const updateHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { habitId } = req.params;
        const { title, description, frequency_count, frequency_period, goalStreak } = req.body;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }
        const habit = yield prismaClient_1.default.habit.findUnique({
            where: { id: habitId, user_id: userId },
        });
        if (!habit) {
            res.status(404).json({ error: 'This habit was not found for this user' });
            return;
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (frequency_count !== undefined)
            updateData.frequency_count = Number(frequency_count);
        if (frequency_period !== undefined)
            updateData.frequency_period = frequency_period;
        if (goalStreak !== undefined)
            updateData.goalStreak = Number(goalStreak);
        const updatedHabit = yield prismaClient_1.default.habit.update({
            where: { id: habitId },
            data: updateData,
        });
        if (!updatedHabit) {
            res.status(404).json({ error: 'The habit was not successfully updated' });
            return;
        }
        (0, exports.recalculateStreaks)(habitId, userId, updatedHabit.frequency_count, updatedHabit.frequency_period, user.dayStart);
        res.status(200).json({ updatedHabit });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        }
        else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateHabit = updateHabit;
const deleteHabit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { habitId } = req.params;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const habit = yield prismaClient_1.default.habit.findUnique({
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
        yield prismaClient_1.default.habit.delete({
            where: {
                id: habitId,
            },
        });
        res.status(200).json({ message: "Habit deleted successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        }
        else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteHabit = deleteHabit;
const createHabitTracking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = yield prismaClient_1.default.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }
        const { habitId, date, notes } = req.body;
        if (!habitId || !date) {
            res.status(400).json({ error: "Missing required fields: habit_id and date are required" });
            return;
        }
        const trackingDate = new Date(date);
        if (isNaN(trackingDate.getTime())) {
            res.status(400).json({ error: "Invalid date format" });
            return;
        }
        const habit = yield prismaClient_1.default.habit.findUnique({
            where: {
                id: habitId,
                user_id: userId
            },
        });
        if (!habit) {
            res.status(404).json({ error: 'This habit was not found for this user' });
            return;
        }
        const newTracking = yield prismaClient_1.default.habitTracking.create({
            data: {
                habit: { connect: { id: habitId } },
                user: { connect: { id: userId } },
                date: trackingDate,
                notes,
            },
        });
        (0, exports.recalculateStreaks)(habitId, user.id, habit.frequency_count, habit.frequency_period, user.dayStart);
        res.status(201).json({ habitTracking: newTracking });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        }
        else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createHabitTracking = createHabitTracking;
const updateHabitTracking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { trackingId } = req.params;
        const { date, notes } = req.body;
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }
        const trackingEntry = yield prismaClient_1.default.habitTracking.findUnique({
            where: { id: trackingId },
            include: { habit: true },
        });
        if (!trackingEntry || trackingEntry.user_id !== userId) {
            res.status(404).json({ error: "Tracking entry not found" });
            return;
        }
        const updatedTracking = yield prismaClient_1.default.habitTracking.update({
            where: { id: trackingId },
            data: {
                date: date ? new Date(date) : trackingEntry.date,
                notes: notes !== undefined ? notes : trackingEntry.notes,
            },
        });
        const habit = trackingEntry.habit;
        (0, exports.recalculateStreaks)(habit.id, userId, habit.frequency_count, habit.frequency_period, user.dayStart);
        res.status(200).json({ updatedTracking });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        }
        else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateHabitTracking = updateHabitTracking;
const deleteHabitTracking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { trackingId } = req.params;
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }
        const trackingEntry = yield prismaClient_1.default.habitTracking.findUnique({
            where: { id: trackingId },
            include: { habit: true },
        });
        if (!trackingEntry || trackingEntry.user_id !== userId) {
            res.status(404).json({ error: "Tracking entry not found" });
            return;
        }
        const habit = trackingEntry.habit;
        yield prismaClient_1.default.habitTracking.delete({
            where: { id: trackingId }
        });
        (0, exports.recalculateStreaks)(habit.id, userId, habit.frequency_count, habit.frequency_period, user.dayStart);
        res.status(200).json({ message: "Habit tracking deleted successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getHabitDetails controller", error.message);
        }
        else {
            console.log("Unexpected error in getHabitDetails controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteHabitTracking = deleteHabitTracking;
// All done in UTC
const recalculateStreaks = (habitId, userId, frequency_count, frequency_period, dayStart) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trackingEntries = yield prismaClient_1.default.habitTracking.findMany({
            where: {
                habit_id: habitId,
                user_id: userId,
            },
            orderBy: {
                date: 'desc',
            },
        });
        // Counts num entries per defined period
        const periodCounts = new Map();
        for (const entry of trackingEntries) {
            const entryDate = new Date(entry.date);
            const key = getPeriodKey(entryDate, frequency_period, dayStart);
            console.log(key, entryDate);
            if (periodCounts.has(key)) {
                periodCounts.get(key).count++;
            }
            else {
                periodCounts.set(key, { count: 1, date: entryDate });
            }
        }
        // Find periods that can count towards the streak
        const qualifyingPeriods = Array.from(periodCounts.entries())
            .filter(([_, { count }]) => count >= frequency_count)
            .map(([key, obj]) => ({ key, date: obj.date }));
        // Sort these valid periods by date
        qualifyingPeriods.sort((a, b) => b.date.getTime() - a.date.getTime());
        console.log("qualifyingPeriods", qualifyingPeriods);
        const currentPeriodKey = getPeriodKey(new Date(), frequency_period, dayStart);
        let currentStreak = 0;
        if (qualifyingPeriods.length > 0 && qualifyingPeriods[0].key === currentPeriodKey) {
            currentStreak = 1;
            for (let i = 1; i < qualifyingPeriods.length; i++) {
                if (isConsecutive(qualifyingPeriods[i - 1].key, qualifyingPeriods[i].key, frequency_period)) {
                    currentStreak++;
                }
                else {
                    break;
                }
            }
        }
        else {
            currentStreak = 0;
        }
        let maxStreak = 0;
        if (qualifyingPeriods.length > 0) {
            let tempStreak = 1;
            maxStreak = 1;
            for (let i = 1; i < qualifyingPeriods.length; i++) {
                if (isConsecutive(qualifyingPeriods[i - 1].key, qualifyingPeriods[i].key, frequency_period)) {
                    tempStreak++;
                }
                else {
                    maxStreak = Math.max(maxStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            maxStreak = Math.max(maxStreak, tempStreak);
        }
        console.log("Recalculated streaks", currentStreak, maxStreak);
        yield prismaClient_1.default.streak.upsert({
            where: {
                habit_id: habitId
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
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in streak recalculation", error.message);
        }
        else {
            console.log("Unexpected error in streak recalculation", error);
        }
        throw error;
    }
});
exports.recalculateStreaks = recalculateStreaks;
function adjustToUserDay(date, dayStart) {
    const [hour, minute] = dayStart.split(":").map(Number);
    const adjusted = new Date(date);
    // Set the date's time to the user's day start.
    adjusted.setUTCHours(hour, minute, 0, 0);
    // If the original date is before the adjusted time, it belongs to the previous day.
    console.log(date.getTime(), adjusted.getTime());
    if (date.getTime() <= adjusted.getTime()) {
        return (0, date_fns_1.addDays)(adjusted, -1);
    }
    return adjusted;
}
function getPeriodKey(date, frequency_period, dayStart) {
    try {
        if (frequency_period === "day") {
            const adjustedDate = adjustToUserDay(date, dayStart);
            return (0, date_fns_1.format)(adjustedDate, "yyyy-MM-dd");
        }
        else if (frequency_period === "week") {
            // Adjust the date first
            const adjustedDate = adjustToUserDay(date, dayStart);
            // Get Monday as the start of the week (weekStartsOn: 1)
            const monday = (0, date_fns_1.startOfWeek)(adjustedDate, { weekStartsOn: 1 });
            return (0, date_fns_1.format)(monday, "yyyy-MM-dd");
        }
        else if (frequency_period === "month") {
            const adjustedDate = adjustToUserDay(date, dayStart);
            return (0, date_fns_1.format)(adjustedDate, "yyyy-MM");
        }
        return "";
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getPeriodKey", error.message);
        }
        else {
            console.log("Unexpected error in getPeriodKey", error);
        }
        throw error;
    }
}
function isConsecutive(prevKey, currKey, frequency_period) {
    try {
        if (frequency_period === "day") {
            const prevDate = new Date(prevKey);
            const currDate = new Date(currKey);
            return (0, date_fns_1.differenceInCalendarDays)(prevDate, currDate) === 1;
        }
        else if (frequency_period === "week") {
            const prevDate = new Date(prevKey);
            const currDate = new Date(currKey);
            return (0, date_fns_1.differenceInCalendarWeeks)(prevDate, currDate, { weekStartsOn: 1 }) === 1;
        }
        else if (frequency_period === "month") {
            const prevDate = new Date(prevKey);
            const currDate = new Date(currKey);
            return (0, date_fns_1.differenceInCalendarMonths)(prevDate, currDate) === 1;
        }
        return false;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in isConsecutive", error.message);
        }
        else {
            console.log("Unexpected error in isConsecutive", error);
        }
        throw error;
    }
}
