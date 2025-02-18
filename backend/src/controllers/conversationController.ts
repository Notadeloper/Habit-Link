import { RequestHandler } from "express";
import prisma from "../prismaClient";

export const getConversationsDM: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                isGroup: false,
                participants: {
                    some: { userId },
                },
            },
            include: {
                participants: true,
                messages: true,
            },
        });

        res.status(200).json({ conversations });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getGroupsForUser controller", error.message);
        } else {
            console.log("Unexpected error in getGroupsForUser controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}