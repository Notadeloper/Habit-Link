import express from "express";
import { signup } from "../controllers/authController";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", signup);
router.post("/logout", signup);

export default router;