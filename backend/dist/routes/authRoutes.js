"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const protectRoute_1 = require("../middleware/protectRoute");
const router = express_1.default.Router();
router.post("/signup", authController_1.signup);
router.post("/login", authController_1.login);
router.post("/logout", authController_1.logout);
router.get("/getme", protectRoute_1.protectRoute, authController_1.getMe);
exports.default = router;
