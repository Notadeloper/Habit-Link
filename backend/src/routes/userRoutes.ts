import express from "express";
import { getFriendRequests, getUserProfile, updateUserProfile, viewFriends, sendFriendRequest, acceptFriendRequest, removeFriend, rejectFriendRequest } from "../controllers/userController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
// update profile
router.put("/profile", protectRoute, updateUserProfile);
router.get("/friends/:username", protectRoute, viewFriends);

router.get("/friend-requests/:userId", protectRoute, getFriendRequests);
router.post("/friend-requests/:userId/send", protectRoute, sendFriendRequest);
router.put("/friend-requests/:userId/accept/:requestId", protectRoute, acceptFriendRequest);
router.delete("/friend-requests/:userId/reject/:requestId", protectRoute, rejectFriendRequest);
router.delete("/friends/remove/:userId", protectRoute, removeFriend);

export default router;