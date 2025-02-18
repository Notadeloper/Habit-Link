import express from "express";
import { addUserToGroup, createGroup, getGroupInfoById, getGroupsForUser, updateGroup, deleteGroup, removeMemberFromGroup, leaveGroup, assignAdmin, assignHabit, getParticipatingHabitUsers } from "../controllers/groupController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

// Create group - also take initial parameters for initial group members
// TODO: Make there be an initial habit to start
router.post("/", protectRoute, createGroup);

// Get list of all groups current user belongs to
router.get("/", protectRoute, getGroupsForUser);

// Get detailed information for a specific group
// TODO: Add info about group streak
// Make sure this is refreshed constantly on the frontend for updates
router.get("/:groupId", protectRoute, getGroupInfoById);

// Update group details (only if admin)
router.put("/:groupId", protectRoute, updateGroup);

// Delete a group (only if admin)
router.delete("/:groupId", protectRoute, deleteGroup);

// Add member to group
router.post("/:groupId/members", protectRoute, addUserToGroup);

// Remove user from group (only if admin)
router.delete("/:groupId/members/:memberId", protectRoute, removeMemberFromGroup);

// Leave a group (for the current user)
router.post("/:groupId/leave", protectRoute, leaveGroup);

// Give someone in the group admin rights (only if admin)
router.put("/:groupId/members/:memberId/admin", protectRoute, assignAdmin);

// Assigns a habit to the challenge (through habit participation)
router.post("/:groupId/habits/assign", protectRoute, assignHabit);

// gets a list of the habits of participating members (for checking if person needs assign)
router.get("/:groupId/habits/participation", protectRoute, getParticipatingHabitUsers);


export default router;