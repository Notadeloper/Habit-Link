"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFriend = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = exports.getFriendRequests = exports.viewFriends = exports.updateUserProfile = exports.getUserProfile = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const habitController_1 = require("./habitController");
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const targetUser = yield prismaClient_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                friendships: true,
                friendFriendships: true,
                dayStart: true,
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
        const isFriend = [...targetUser.friendships, ...targetUser.friendFriendships].some((friendship) => friendship.user_id === loggedInUserId || friendship.friend_id === loggedInUserId);
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
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getUserProfile controller", error.message);
        }
        else {
            console.log("Unexpected error in getUserProfile controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getUserProfile = getUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { fullName, email, username, currentPassword, newPassword, dayStart } = req.body;
        const user = yield prismaClient_1.default.user.findUnique({ where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            res.status(400).json({ error: "Please provide current password and new password" });
            return;
        }
        const updateData = {};
        if (fullName)
            updateData.fullName = fullName;
        if (email)
            updateData.email = email;
        if (username)
            updateData.username = username;
        if (dayStart) {
            updateData.dayStart = dayStart;
            updateData.onboardingCompleted = true;
        }
        if (currentPassword && newPassword) {
            const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                res.status(401).json({ error: "Current password is incorrect" });
                return;
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            updateData.password = yield bcryptjs_1.default.hash(newPassword.toString(), salt);
        }
        const updatedUser = yield prismaClient_1.default.user.update({
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
        if (dayStart) {
            const userHabits = yield prismaClient_1.default.habit.findMany({
                where: { user_id: user.id },
            });
            for (const habit of userHabits) {
                (0, habitController_1.recalculateStreaks)(habit.id, user.id, habit.frequency_count, habit.frequency_period, dayStart);
            }
        }
        res.status(200).json(updatedUser);
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in updateUserProfile controller", error.message);
        }
        else {
            console.log("Unexpected error in updateUserProfile controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateUserProfile = updateUserProfile;
const viewFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!loggedInUserId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        const targetUser = yield prismaClient_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                friendships: true,
                friendFriendships: true,
            },
        });
        if (!targetUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isFriend = [...targetUser.friendships, ...targetUser.friendFriendships].some((friendship) => friendship.user_id === loggedInUserId || friendship.friend_id === loggedInUserId);
        const totalFriendships = [...targetUser.friendships, ...targetUser.friendFriendships];
        if (targetUser.id !== loggedInUserId && !isFriend) {
            res.status(401).json({ error: "Cannot view friends" });
            return;
        }
        res.status(200).json({ username: targetUser.username, friendList: totalFriendships });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in viewFriends controller", error.message);
        }
        else {
            console.log("Unexpected error in viewFriends controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.viewFriends = viewFriends;
const getFriendRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // We refetch for efficiency -> fetching additional data here instead of protect route
        const targetUser = yield prismaClient_1.default.user.findUnique({
            where: { id: loggedInUserId },
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
        res.status(200).json({ username: targetUser.username, friendRequests: targetUser.receivedFriendRequests });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getFriendRequests controller", error.message);
        }
        else {
            console.log("Unexpected error in getFriendRequests controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getFriendRequests = getFriendRequests;
const sendFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId: recipientUserId } = req.body;
        const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!loggedInUserId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (recipientUserId === loggedInUserId) {
            res.status(400).json({ error: "Cannot send friend request to yourself" });
            return;
        }
        const requestingUser = yield prismaClient_1.default.user.findUnique({
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
        const recipientUser = yield prismaClient_1.default.user.findUnique({
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
        const isFriend = [...recipientUser.friendships, ...recipientUser.friendFriendships].some((friendship) => friendship.user_id === loggedInUserId || friendship.friend_id === loggedInUserId);
        if (isFriend) {
            res.status(400).json({ error: "Cannot send request to an existing friend" });
            return;
        }
        const newFriendRequest = yield prismaClient_1.default.friendRequest.create({
            data: {
                sender: { connect: { id: requestingUser.id } },
                receiver: { connect: { id: recipientUserId } },
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
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in  sendFriendRequest controller", error.message);
        }
        else {
            console.log("Unexpected error in sendFriendRequest controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.sendFriendRequest = sendFriendRequest;
const acceptFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { requestId } = req.params;
        const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!loggedInUserId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (!requestId) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }
        const friendRequest = yield prismaClient_1.default.friendRequest.findUnique({
            where: {
                id: requestId,
                status: "pending"
            },
        });
        if (!friendRequest) {
            res.status(404).json({ error: "Friend request not found or already processed" });
            return;
        }
        if (friendRequest.receiver_id !== loggedInUserId) {
            res.status(401).json({ error: "Cannot accept friend requests for other users" });
            return;
        }
        const result = yield prismaClient_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma.friendRequest.delete({
                where: { id: requestId },
            });
            const newFriendship = yield prisma.friendship.create({
                data: {
                    user: { connect: { id: friendRequest.sender_id } },
                    friend: { connect: { id: loggedInUserId } },
                },
            });
            return { newFriendship };
        }));
        res.status(200).json({
            message: "Friend request accepted",
            friendship: result.newFriendship
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in acceptFriendRequest controller", error.message);
        }
        else {
            console.log("Unexpected error in acceptFriendRequest controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.acceptFriendRequest = acceptFriendRequest;
const rejectFriendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { requestId } = req.params;
        const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!loggedInUserId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (!requestId) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }
        const friendRequest = yield prismaClient_1.default.friendRequest.findUnique({
            where: {
                id: requestId,
                status: "pending"
            }
        });
        if (!friendRequest) {
            res.status(404).json({ error: "Friend request not found or already processed" });
            return;
        }
        if (friendRequest.receiver_id !== loggedInUserId && friendRequest.sender_id !== loggedInUserId) {
            res.status(401).json({ error: "Cannot reject or cancel friend requests for other users" });
            return;
        }
        yield prismaClient_1.default.friendRequest.delete({
            where: { id: requestId },
        });
        res.status(200).json({
            message: "Friend request successfully rejected or cancelled",
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in rejectFriendRequest controller", error.message);
        }
        else {
            console.log("Unexpected error in rejectFriendRequest controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.rejectFriendRequest = rejectFriendRequest;
const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId: friendToRemoveId } = req.params;
        const loggedInUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!loggedInUserId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (!friendToRemoveId) {
            res.status(400).json({ error: "Missing required parameters" });
            return;
        }
        const friendship = yield prismaClient_1.default.friendship.findFirst({
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
        yield prismaClient_1.default.friendship.delete({
            where: {
                id: friendship.id
            }
        });
        res.status(200).json({
            message: "Friend removed successfully"
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in removeFriend controller", error.message);
        }
        else {
            console.log("Unexpected error in removeFriend controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.removeFriend = removeFriend;
