"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const habitController_1 = require("../controllers/habitController");
const protectRoute_1 = require("../middleware/protectRoute");
const router = express_1.default.Router();
// Create new habit (individual)
router.post("/", protectRoute_1.protectRoute, habitController_1.createHabit);
// Get habits for user
router.get("/", protectRoute_1.protectRoute, habitController_1.getHabitsForUser);
// Get specific  habit deatils
router.get("/:habitId", protectRoute_1.protectRoute, habitController_1.getHabitDetails);
// Update habit details (if freq period changes, recalculate streak)
router.put("/:habitId", protectRoute_1.protectRoute, habitController_1.updateHabit);
// Delete Habit
router.delete("/:habitId", protectRoute_1.protectRoute, habitController_1.deleteHabit);
// Create a new tracking entry for a habit (e.g., mark the habit as completed for a day) 
router.post("/tracking", protectRoute_1.protectRoute, habitController_1.createHabitTracking);
// Update a habit tracking entry
router.put("/tracking/:trackingId", protectRoute_1.protectRoute, habitController_1.updateHabitTracking);
// Delete a habit tracking entry
router.delete("/tracking/:trackingId", protectRoute_1.protectRoute, habitController_1.deleteHabitTracking);
exports.default = router;
