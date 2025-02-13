import express from "express";
import { createHabit, getHabitsForUser, getHabitDetails, deleteHabit } from "../controllers/habitController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

// Create new habit (individual)

router.post("/", protectRoute, createHabit);

// Get habits for user
router.get("/", protectRoute, getHabitsForUser);

// Get specific  habit deatils
router.get("/:habitId", protectRoute, getHabitDetails);

// Update habit details (if freq period changes, recalculate streak)
router.put("/:habitId", protectRoute, createHabit);

// Delete Habit
router.delete("/:habitId", protectRoute, deleteHabit);

// Create a new tracking entry for a habit (e.g., mark the habit as completed for a day) 
router.post("/tracking", protectRoute, createHabit);

// Update a habit tracking entry
router.get("/tracking/:trackingId", protectRoute, createHabit);

// Delete a habit tracking entry
router.delete("/tracking/:trackingId", protectRoute, createHabit);


/* Habit Tracking Routes
These endpoints log progress or activity on a habit.


POST /api/habit-tracking
Create a new tracking entry for a habit (e.g., mark the habit as completed for a day).

GET /api/habit-tracking?habitId=XYZ
Retrieve tracking logs for a specific habit.

PUT /api/habit-tracking/:trackingId
Update a tracking entry (if needed).

DELETE /api/habit-tracking/:trackingId
Delete a tracking entry.

Note: In many apps, streaks are computed or updated automatically when habit tracking is recorded, so you might not need separate streak endpoints. */

export default router;