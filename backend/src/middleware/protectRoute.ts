import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient";
const { JWT_SECRET } = process.env;

interface DecodedToken extends jwt.JwtPayload {
    userId: string;
}

export const protectRoute: RequestHandler = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).json({error: "Unauthorised: No Token Provided"});
            return;
        }

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        if (!decoded || !decoded.userId) {
            res.status(401).json({ error: "Unauthorised: Invalid Token!" });
            return;
        }

        const fullUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!fullUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        const { password, ...userWithoutPassword } = fullUser;
        req.user = userWithoutPassword;
        next();
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log("Unexpected error", error);
        }        
        res.status(500).json({ error: "Invalid Server Error" });
    }
}