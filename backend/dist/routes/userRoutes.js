"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const protectRoute_1 = require("../middleware/protectRoute");
const router = express_1.default.Router();
router.get("/profile/:userId", protectRoute_1.protectRoute, userController_1.getUserProfile);
// update profile
router.put("/profile", protectRoute_1.protectRoute, userController_1.updateUserProfile);
router.get("/friends/:userId", protectRoute_1.protectRoute, userController_1.viewFriends);
router.get("/friend-requests", protectRoute_1.protectRoute, userController_1.getFriendRequests);
router.post("/friend-requests", protectRoute_1.protectRoute, userController_1.sendFriendRequest);
router.put("/friend-requests/:requestId/accept", protectRoute_1.protectRoute, userController_1.acceptFriendRequest);
router.delete("/friend-requests/:requestId", protectRoute_1.protectRoute, userController_1.rejectFriendRequest);
router.delete("/friends/:userId", protectRoute_1.protectRoute, userController_1.removeFriend);
exports.default = router;
