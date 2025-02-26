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
            orderBy: {
                updated_at: "desc",
            },
        });

        res.status(200).json({ conversations });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getConversationsDM controller", error.message);
        } else {
            console.log("Unexpected error in getConversationsDM controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getConversation: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { conversationId } = req.params;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
                participants: {
                    some: { userId },
                },
            },
            include: {
                participants: true,
                messages: {
                    orderBy: {
                        created_at: "desc",
                    },
                }
            }
        });

        if (!conversation) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        res.status(200).json({ conversation });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getConversation controller", error.message);
        } else {
            console.log("Unexpected error in getConversation controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const createConversation: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { userId: otherParticipantId } = req.params;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        if (!otherParticipantId) {
            res.status(400).json({ error: "Bad request: participant id is required" });
            return;
        }

        const existingConversation = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    {
                        participants: {
                            some: { userId: userId },
                        },
                    },
                    {
                        participants: {
                            some: { userId: otherParticipantId },
                        },
                    },
                ],
            },
            include: {
                participants: true,
            },
        });
      
        if (existingConversation) {
        res.status(400).json({ error: "Conversation already exists" });
        return;
        }

        const conversation = await prisma.conversation.create({
            data: {
                isGroup: false,
                participants: {
                    create: [
                        { user: { connect: { id: userId } } },
                        { user: { connect: { id: otherParticipantId } } },
                    ],
                },
            },
            include: {
                participants: true,
            },
          });

        res.status(201).json({ conversation });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in createConversation controller", error.message);
        } else {
            console.log("Unexpected error in createConversation controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const sendMessage: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { conversationId } = req.params;
        const { content } = req.body; // Expect at least content

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        if (!conversationId) {
            res.status(400).json({ error: "Bad request: conversation id is required" });
            return;
        }

        if (!content) {
            res.status(400).json({ error: "Bad request: content is required" });
            return;
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true },
        });
          
        if (!conversation || !conversation.participants.some(p => p.userId === userId)) {
            res.status(404).json({ error: "Conversation not found or access denied" });
            return;
        }

        const newMessage = await prisma.message.create({
                data: {
                    conversation: { connect: { id: conversationId } },
                    sender: { connect: { id: userId } },
                    content,
                },
        });

        // update parent
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updated_at: new Date() },
        });
      
        res.status(201).json({ message: newMessage });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getGroupsForUser controller", error.message);
        } else {
            console.log("Unexpected error in getGroupsForUser controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}