import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prismaClient";
import { SignupRequestBody } from "../interfaces/User";

const SALT_ROUNDS = 10;

export const signup: RequestHandler<{}, any, SignupRequestBody> = async (req, res) => {
    try {
        const { username, email, fullName, password }: SignupRequestBody = req.body;

        if (!username || !email || !fullName || !password) {
            res.status(400).json({ error: 'All fields are required.' });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
    
        if (existingUser) {
            res.status(409).json({ error: 'Username or email already in use.' });
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

        const { password: _, ...userWithoutPassword } = newUser;

        // Token creation and sending logic will be added here

        res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
  }