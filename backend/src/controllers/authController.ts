import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prismaClient";
import { SignupRequestBody, LoginRequestBody } from "../interfaces/User";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken";

const SALT_ROUNDS = 10;

export const signup: RequestHandler = async (req, res) => {
    try {
        const { username, email, fullName, password }: SignupRequestBody = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
    
        if (existingUser) {
            res.status(409).json({ error: 'Username or email already in use.' });
            return;
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                fullName,
                password: hashedPassword,
            },
        });

        generateTokenAndSetCookie(newUser.id, res);

        const { password: _, ...userWithoutPassword } = newUser;

        // Token creation and sending logic will be added here

        res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in signup controller", error.message);
        } else {
            console.log("Unexpected error in signup controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const login: RequestHandler = async (req, res) => {
    try {
        const { usernameOrEmail, password }: LoginRequestBody = req.body;

        if (!usernameOrEmail || !password) {
            res.status(400).json({ error: 'All fields are required.' });
            return;
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            },
        });

        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) {
            res.status(404).json({ error: 'Invalid username or email or password.' });
            return;
        }

        generateTokenAndSetCookie(user.id, res);

        const { password: _, ...userWithoutPassword } = user;

       res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in login controller", error.message);
        } else {
            console.log("Unexpected error in login controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const logout: RequestHandler = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            expires: new Date(0),
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
        });    
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in logout controller", error.message);
        } else {
            console.log("Unexpected error in logout controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}