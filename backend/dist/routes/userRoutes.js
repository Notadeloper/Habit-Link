"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const protectRoute_1 = require("../middleware/protectRoute");
const router = express_1.default.Router();
router.get("/profile/:username", protectRoute_1.protectRoute, userController_1.getUserProfile);
// update profile
router.put("/profile", protectRoute_1.protectRoute, userController_1.getUserProfile);
router.get("/friend-requests/get/:userId", userController_1.getUserProfile);
router.post("/friend-requests/send/:userId", userController_1.getUserProfile);
router.put("/friend-requests/accept/:userId/:requestId", userController_1.getUserProfile);
router.delete("/friend-requests/reject/:userId/:requestId", userController_1.getUserProfile);
exports.default = router;
