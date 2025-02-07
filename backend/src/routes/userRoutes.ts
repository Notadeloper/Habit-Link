import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/userController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
// update profile
router.put("/profile", protectRoute, updateUserProfile);
router.get("/friends", protectRoute, getUserProfile);

router.get("/friend-requests/get/:userId", getUserProfile);
router.post("/friend-requests/send/:userId", getUserProfile);
router.put("/friend-requests/accept/:userId/:requestId", getUserProfile);
router.delete("/friend-requests/reject/:userId/:requestId", getUserProfile);

export default router;