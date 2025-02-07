
import { RequestHandler } from "express";
import prisma from "../prismaClient";
import bcrypt from "bcryptjs";
import { UpdateUserRequestBody } from "../interfaces/User";

export const getUserProfile: RequestHandler = async (req, res) => {
    try {
        const { username } = req.params;
        const loggedInUserId = req.user?.id;

        const targetUser = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                friendships: true,
                friendFriendships: true,
            },
        });

        if (!targetUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const totalFriendCount = targetUser.friendships.length + targetUser.friendFriendships.length;

        if (targetUser.id === loggedInUserId) {
            res.status(200).json({ user: targetUser, totalFriendCount });
            return;
        }

        const isFriend = targetUser.friendships.some((friendship) => 
            friendship.user_id === loggedInUserId || friendship.friend_id === loggedInUserId
        ); 

        if (isFriend) {
            res.status(200).json({
                user: {
                    username: targetUser.username,
                    fullName: targetUser.fullName,
                    totalFriendCount: totalFriendCount,
                },
            });
            return;
        }

        res.status(200).json({
            user: {
                username: targetUser.username,
                totalFriendCount: totalFriendCount,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getUserProfile controller", error.message);
        } else {
            console.log("Unexpected error in getUserProfile controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateUserProfile: RequestHandler = async (req, res) => {
    try {
        const { fullName, email, username, currentPassword, newPassword  }: UpdateUserRequestBody = req.body;
    
        const user = await prisma.user.findUnique({ where: { id: req.user?.id } });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            res.status(400).json( { error: "Please provide current password and new password" });
            return;
        }

        const updateData: any = {};
        
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email;
        if (username) updateData.username = username;

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if (!isMatch) {
                res.status(401).json({ error: "Current password is incorrect" });
                return;
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(newPassword.toString(), salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                email: true,
                username: true,
                // Don't include password in the response
            }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in updateUserProfile controller", error.message);
        } else {
            console.log("Unexpected error in updateUserProfile controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}
