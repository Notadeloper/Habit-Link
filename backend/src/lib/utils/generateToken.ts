import { Response } from "express";
import jwt from "jsonwebtoken";

// Optional: create a custom error if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

export function generateTokenAndSetCookie(userId: string, res: Response): void {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development", // secure in prod
  });
}