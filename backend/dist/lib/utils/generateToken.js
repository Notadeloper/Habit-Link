"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenAndSetCookie = generateTokenAndSetCookie;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Optional: create a custom error if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
}
function generateTokenAndSetCookie(userId, res) {
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development", // secure in prod
    });
}
