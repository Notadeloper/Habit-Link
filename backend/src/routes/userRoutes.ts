import express from "express";
import { getFriendRequests, getUserProfile, updateUserProfile, viewFriends, sendFriendRequest, acceptFriendRequest, removeFriend, rejectFriendRequest } from "../controllers/userController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/profile/:userId", protectRoute, getUserProfile);
// update profile
router.put("/profile", protectRoute, updateUserProfile);
router.get("/friends/:userId", protectRoute, viewFriends);

router.get("/friend-requests", protectRoute, getFriendRequests);
router.post("/friend-requests", protectRoute, sendFriendRequest);
router.put("/friend-requests/:requestId/accept", protectRoute, acceptFriendRequest);
router.delete("/friend-requests/:requestId", protectRoute, rejectFriendRequest);
router.delete("/friends/:userId", protectRoute, removeFriend);

export default router;