
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

        const isFriend = [ ...targetUser.friendships, ...targetUser.friendFriendships].some((friendship) => 
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

export const viewFriends: RequestHandler = async (req, res) => {
    try {
        const { username } = req.params;
        const loggedInUserId = req.user?.id;

        const targetUser = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                friendships: true,
                friendFriendships: true,
            },
        });

        if (!targetUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const isFriend = [ ...targetUser.friendships, ...targetUser.friendFriendships].some((friendship) => 
            friendship.user_id === loggedInUserId || friendship.friend_id === loggedInUserId
        ); 

        const totalFriendships = [...targetUser.friendships, ...targetUser.friendFriendships];

        if (targetUser.id !== loggedInUserId && !isFriend) {
            res.status(401).json({ error: "Cannot view friends" });
            return;
        }

        res.status(200).json({ username: username, friendList: totalFriendships });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in viewFriends controller", error.message);
        } else {
            console.log("Unexpected error in viewFriends controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getFriendRequests: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = req.user?.id;

        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                receivedFriendRequests: true
            },
        });

        if (!targetUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (targetUser.id !== loggedInUserId) {
            res.status(401).json({ error: "Cannot view friend requests" });
            return;
        }

        res.status(200).json({ username: targetUser.username, friendRequests: targetUser.receivedFriendRequests });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getFriendRequests controller", error.message);
        } else {
            console.log("Unexpected error in getFriendRequests controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const sendFriendRequest: RequestHandler = async (req, res) => {
    try {
        const { userId: recipientUserId } = req.params;
        const loggedInUserId = req.user?.id;

        if (recipientUserId === loggedInUserId) {
            res.status(400).json({ error: "Cannot send friend request to yourself" });
            return;
        }

        const requestingUser = await prisma.user.findUnique({
            where: { id: loggedInUserId },
            select: {
                id: true,
                username: true,
                sentFriendRequests: {
                    where: {
                        receiver_id: recipientUserId,
                        status: "pending"
                    }
                }           
            },
        });

        console.log("recipientUserId", recipientUserId);

        const recipientUser = await prisma.user.findUnique({
            where: { id: recipientUserId },
            select: {
                id: true,
                username: true,
                receivedFriendRequests: true,
                friendships: true,
                friendFriendships: true
            },
        });

        if (!requestingUser || !recipientUser) {
            res.status(404).json({ error: "Requesting or recipient user not found" });
            return;
        }

        if (requestingUser.sentFriendRequests.length > 0) {
            res.status(400).json({ error: "Friend request already pending" });
            return;
        }

        const isFriend = [...recipientUser.friendships, ...recipientUser.friendFriendships].some(
            (friendship) => friendship.user_id === loggedInUserId || friendship.friend_id === loggedInUserId
        );

        if (isFriend) {
            res.status(400).json({ error: "Cannot send request to an existing friend" });
            return;
        }

        const newFriendRequest = await prisma.friendRequest.create({
            data: {
                sender_id: requestingUser.id,
                receiver_id: recipientUserId,
                status: "pending"
            },
            include: {
                sender: {
                    select: {
                        username: true,
                        fullName: true
                    }
                }
            }
        });

        res.status(200).json({ 
            message: "Friend request sent successfully",
            request: newFriendRequest 
        });
        
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in  sendFriendRequest controller", error.message);
        } else {
            console.log("Unexpected error in sendFriendRequest controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const acceptFriendRequest: RequestHandler = async (req, res) => {
    try {
        const { userId: acceptingUserId, requestId } = req.params;
        const loggedInUserId = req.user?.id;

        if (!loggedInUserId || !acceptingUserId || !requestId) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }

        if (acceptingUserId !== loggedInUserId) {
            res.status(401).json({ error: "Cannot accept friend requests for other users" });
            return;
        }

        const friendRequest = await prisma.friendRequest.findUnique({
            where: { 
                id: requestId,
                receiver_id: loggedInUserId,
                status: "pending"
            }
        });

        if (!friendRequest) {
            res.status(404).json({ error: "Friend request not found or already processed" });
            return;
        }

        const result = await prisma.$transaction(async (prisma) => {
            await prisma.friendRequest.delete({
                where: { id: requestId },
            });

            const newFriendship = await prisma.friendship.create({
                data: {
                    user_id: friendRequest.sender_id,
                    friend_id: loggedInUserId
                },
            });

            return { newFriendship };
        });

        res.status(200).json({
            message: "Friend request accepted",
            friendship: result.newFriendship
        });
        
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in acceptFriendRequest controller", error.message);
        } else {
            console.log("Unexpected error in acceptFriendRequest controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const rejectFriendRequest: RequestHandler = async (req, res) => {
    try {
        const { userId: acceptingUserId, requestId } = req.params;
        const loggedInUserId = req.user?.id;

        if (!loggedInUserId || !acceptingUserId || !requestId) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }

        if (acceptingUserId !== loggedInUserId) {
            res.status(401).json({ error: "Cannot reject friend requests for other users" });
            return;
        }

        const friendRequest = await prisma.friendRequest.findUnique({
            where: { 
                id: requestId,
                receiver_id: loggedInUserId,
                status: "pending"
            }
        });

        if (!friendRequest) {
            res.status(404).json({ error: "Friend request not found or already processed" });
            return;
        }

        await prisma.friendRequest.delete({
            where: { id: requestId },
        });


        res.status(200).json({
            message: "Friend request rejected",
        });
        
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in acceptFriendRequest controller", error.message);
        } else {
            console.log("Unexpected error in acceptFriendRequest controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const removeFriend: RequestHandler = async (req, res) => {
    try {
        const { userId: friendToRemoveId } = req.params;
        const loggedInUserId = req.user?.id;

        if (!loggedInUserId || !friendToRemoveId) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }

        const friendship = await prisma.friendship.findFirst({
            where: { 
                OR: [
                    { 
                        user_id: loggedInUserId,
                        friend_id: friendToRemoveId
                    },
                    {
                        user_id: friendToRemoveId,
                        friend_id: loggedInUserId
                    }
                ]
            }
        });

        if (!friendship) {
            res.status(404).json({ error: "Friendship not found" });
            return;
        }

        await prisma.friendship.delete({
            where: {
                id: friendship.id
            }
        });

        res.status(200).json({
            message: "Friend removed successfully"
        });

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in acceptFriendRequest controller", error.message);
        } else {
            console.log("Unexpected error in acceptFriendRequest controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

// delete all current friends and friend reqs in db tmr