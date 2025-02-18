"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const groupController_1 = require("../controllers/groupController");
const protectRoute_1 = require("../middleware/protectRoute");
const router = express_1.default.Router();
// Create group - also take initial parameters for initial group members
// TODO: Make there be an initial habit to start
router.post("/", protectRoute_1.protectRoute, groupController_1.createGroup);
// Get list of all groups current user belongs to
router.get("/", protectRoute_1.protectRoute, groupController_1.getGroupsForUser);
// Get detailed information for a specific group
// TODO: Add info about group streak
// Make sure this is refreshed constantly on the frontend for updates
router.get("/:groupId", protectRoute_1.protectRoute, groupController_1.getGroupInfoById);
// Update group details (only if admin)
router.put("/:groupId", protectRoute_1.protectRoute, groupController_1.updateGroup);
// Delete a group (only if admin)
router.delete("/:groupId", protectRoute_1.protectRoute, groupController_1.deleteGroup);
// Add member to group
router.post("/:groupId/members", protectRoute_1.protectRoute, groupController_1.addUserToGroup);
// Remove user from group (only if admin)
router.delete("/:groupId/members/:memberId", protectRoute_1.protectRoute, groupController_1.removeMemberFromGroup);
// Leave a group (for the current user)
router.post("/:groupId/leave", protectRoute_1.protectRoute, groupController_1.leaveGroup);
// Give someone in the group admin rights (only if admin)
router.put("/:groupId/members/:memberId/admin", protectRoute_1.protectRoute, groupController_1.assignAdmin);
// Assigns a habit to the challenge (through habit participation)
router.post("/:groupId/habits/assign");
// gets a list of the habits of participating members (for checking if person needs assign)
router.get("/:groupId/habits/participation");
exports.default = router;
