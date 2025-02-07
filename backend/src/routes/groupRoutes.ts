import express from "express";
import { signup, login, logout } from "../controllers/authController";

const router = express.Router();

router.post("/profile/:username", signup);
router.post("/follow/:id", login);
router.post("/update", logout);

export default router;