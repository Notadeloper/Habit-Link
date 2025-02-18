import express from "express";
import { createHabit, getHabitsForUser, getHabitDetails, deleteHabit, createHabitTracking, updateHabit, updateHabitTracking, deleteHabitTracking } from "../controllers/habitController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

// Create new habit (individual)
router.post("/", protectRoute, createHabit);

// Get habits for user
router.get("/", protectRoute, getHabitsForUser);

// Get specific  habit deatils
router.get("/:habitId", protectRoute, getHabitDetails);

// Update habit details (if freq period changes, recalculate streak)
router.put("/:habitId", protectRoute, updateHabit);

// Delete Habit
router.delete("/:habitId", protectRoute, deleteHabit);

// Create a new tracking entry for a habit (e.g., mark the habit as completed for a day) 
router.post("/tracking", protectRoute, createHabitTracking);

// Update a habit tracking entry
router.put("/tracking/:trackingId", protectRoute, updateHabitTracking);

// Delete a habit tracking entry
router.delete("/tracking/:trackingId", protectRoute, deleteHabitTracking);

export default router;