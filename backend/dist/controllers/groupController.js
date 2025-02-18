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
exports.assignAdmin = exports.leaveGroup = exports.removeMemberFromGroup = exports.addUserToGroup = exports.deleteGroup = exports.updateGroup = exports.getGroupInfoById = exports.getGroupsForUser = exports.createGroup = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const createGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Empty string if description omitted
        const { name, description = "", memberIds, habitTitle, frequency_count, frequency_period, goalStreak } = req.body;
        const creatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!creatorId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (!name) {
            res.status(400).json({ error: "Name is required" });
            return;
        }
        if (!habitTitle || frequency_count === undefined || !frequency_period) {
            res.status(400).json({ error: "Missing required group habit fields: habitTitle, frequency_count, frequency_period" });
            return;
        }
        const additionalMemberIds = memberIds ? memberIds.filter((id) => id !== creatorId) : [];
        const newGroup = yield prismaClient_1.default.group.create({
            data: {
                name,
                description,
                groupHabit: {
                    create: {
                        title: habitTitle,
                        frequency_count: Number(frequency_count),
                        frequency_period,
                        goalStreak: goalStreak !== undefined ? Number(goalStreak) : undefined,
                    },
                },
                creator: { connect: { id: creatorId } },
                memberships: {
                    create: [
                        { user: { connect: { id: creatorId } }, role: "ADMIN" }, // set creator as ADMIN
                        ...additionalMemberIds.map((id) => ({
                            user: { connect: { id } },
                            // These will default to USER since role is not provided.
                        })),
                    ],
                },
                conversation: {
                    create: {
                        isGroup: true,
                    },
                },
            },
            include: {
                memberships: {
                    include: { user: true },
                },
                conversation: true,
                groupHabit: true,
            },
        });
        if (!newGroup) {
            res.status(400).json({ error: "Could not create group" });
            return;
        }
        res.status(201).json({ group: newGroup });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in createGroup controller", error.message);
        }
        else {
            console.log("Unexpected error in createGroup controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createGroup = createGroup;
const getGroupsForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        const groups = yield prismaClient_1.default.group.findMany({
            where: {
                memberships: {
                    some: {
                        user_id: userId,
                    },
                },
            },
        });
        res.status(200).json({ groups });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getGroupsForUser controller", error.message);
        }
        else {
            console.log("Unexpected error in getGroupsForUser controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getGroupsForUser = getGroupsForUser;
// Also return max streak here
const getGroupInfoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { groupId } = req.params;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        const group = yield prismaClient_1.default.group.findUnique({
            where: { id: groupId },
            include: {
                memberships: true,
                conversation: true,
                groupHabit: {
                    include: {
                        participations: {
                            include: {
                                habit: {
                                    include: {
                                        streak: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });
        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }
        if (!group.memberships.some((membership) => membership.user_id === userId)) {
            res.status(403).json({ error: "Unauthorized: User is not a member of this group" });
            return;
        }
        let groupMaxStreak = 0;
        if (group.groupHabit && group.groupHabit.participations) {
            for (const participation of group.groupHabit.participations) {
                if (participation.habit.streak) {
                    const currentStreak = participation.habit.streak.current_streak;
                    groupMaxStreak = Math.max(groupMaxStreak, currentStreak);
                }
            }
        }
        res.status(200).json({ group, groupStreak: groupMaxStreak });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in getGroupInfoById controller", error.message);
        }
        else {
            console.log("Unexpected error in getGroupInfoById controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getGroupInfoById = getGroupInfoById;
// UPDATE THIS FUNCTION
const updateGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { groupId } = req.params;
        const { name, description } = req.body;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        const group = yield prismaClient_1.default.group.findUnique({
            where: { id: groupId },
            include: { memberships: true },
        });
        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }
        const inviterMembership = group.memberships.find((membership) => membership.user_id === userId);
        if (!inviterMembership || inviterMembership.role !== "ADMIN") {
            res.status(403).json({ error: "Not authorized to update this group" });
            return;
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (description)
            updateData.description = description;
        const updatedGroup = yield prismaClient_1.default.group.update({
            where: { id: groupId },
            data: updateData,
        });
        res.status(200).json({ group: updatedGroup });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in updateGroup controller", error.message);
        }
        else {
            console.log("Unexpected error in updateGroup controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateGroup = updateGroup;
const deleteGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { groupId } = req.params;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        const group = yield prismaClient_1.default.group.findUnique({
            where: { id: groupId },
            include: { memberships: true },
        });
        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }
        const adminMembership = group.memberships.find((membership) => membership.user_id === userId && membership.role === "ADMIN");
        if (!adminMembership) {
            res.status(403).json({ error: "Forbidden: Not authorized to delete this group" });
            return;
        }
        const deletedGroup = yield prismaClient_1.default.group.delete({
            where: { id: groupId },
        });
        res.status(200).json({ message: "Group deleted successfully", group: deletedGroup });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in deleteGroup controller", error.message);
        }
        else {
            console.log("Unexpected error in deleteGroup controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteGroup = deleteGroup;
const addUserToGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { groupId } = req.params;
        const { memberId } = req.body;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (userId === memberId) {
            res.status(400).json({ error: "Bad Request: Cannot add self to group" });
            return;
        }
        const group = yield prismaClient_1.default.group.findUnique({
            where: { id: groupId },
            include: { memberships: true },
        });
        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }
        const inviterMembership = group.memberships.find((membership) => membership.user_id === userId);
        if (!inviterMembership || inviterMembership.role !== "ADMIN") {
            res.status(403).json({ error: "Not authorized to add members to this group" });
            return;
        }
        const existingMembership = group.memberships.find((membership) => membership.user_id === memberId);
        if (existingMembership) {
            res.status(400).json({ error: "User is already a member" });
            return;
        }
        const newMembership = yield prismaClient_1.default.membership.create({
            data: {
                group: { connect: { id: groupId } },
                user: { connect: { id: memberId } },
                role: "USER",
            },
        });
        res.status(201).json({ message: "Member added successfully", membership: newMembership });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in addUserToGroup controller", error.message);
        }
        else {
            console.log("Unexpected error in addUserToGroup controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.addUserToGroup = addUserToGroup;
const removeMemberFromGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { memberId, groupId } = req.params;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (!memberId || !groupId) {
            res.status(400).json({ error: "Bad Request: Member ID and Group ID are required" });
            return;
        }
        if (userId === memberId) {
            res.status(400).json({ error: "Bad Request: Cannot remove self from group" });
            return;
        }
        const group = yield prismaClient_1.default.group.findUnique({
            where: { id: groupId },
            include: { memberships: true },
        });
        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }
        const adminMembership = group.memberships.find((membership) => membership.user_id === userId && membership.role === "ADMIN");
        if (!adminMembership) {
            res.status(403).json({ error: "Forbidden: Not authorized to remove this member" });
            return;
        }
        const targetMembership = group.memberships.find((membership) => membership.user_id === memberId);
        if (!targetMembership) {
            res.status(404).json({ error: "Membership not found: User is not a member of this group" });
            return;
        }
        yield prismaClient_1.default.membership.delete({
            where: {
                user_id_group_id: { user_id: memberId, group_id: groupId },
            },
        });
        res.status(200).json({ message: "Member removed successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in removeMemberFromGroup controller", error.message);
        }
        else {
            console.log("Unexpected error in removeMemberFromGroup controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.removeMemberFromGroup = removeMemberFromGroup;
const leaveGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { groupId } = req.params;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (!groupId) {
            res.status(400).json({ error: "Bad Request: Group ID is required" });
            return;
        }
        const group = yield prismaClient_1.default.group.findUnique({
            where: { id: groupId },
            include: { memberships: true },
        });
        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }
        const membership = group.memberships.find((membership) => membership.user_id === userId);
        if (!membership) {
            res.status(400).json({ error: "Bad Request: User is not a member of this group" });
            return;
        }
        // If the user is an admin, ensure they are not the only admin.
        if (membership.role === "ADMIN") {
            const adminCount = group.memberships.filter(m => m.role === "ADMIN").length;
            if (adminCount < 2) {
                res.status(400).json({ error: "Cannot leave group as you are the only admin" });
                return;
            }
        }
        yield prismaClient_1.default.membership.delete({
            where: {
                user_id_group_id: {
                    user_id: userId,
                    group_id: groupId,
                },
            },
        });
        res.status(200).json({ message: "Left group successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in leaveGroup controller", error.message);
        }
        else {
            console.log("Unexpected error in leaveGroup controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.leaveGroup = leaveGroup;
const assignAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { groupId, memberId } = req.params;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }
        if (!groupId) {
            res.status(400).json({ error: "Bad Request: Group ID is required" });
            return;
        }
        const group = yield prismaClient_1.default.group.findUnique({
            where: { id: groupId },
            include: { memberships: true },
        });
        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }
        const userMembership = group.memberships.find((membership) => membership.user_id === userId);
        const memberMembership = group.memberships.find((membership) => membership.user_id === memberId);
        if (!userMembership || userMembership.role !== "ADMIN") {
            res.status(400).json({ error: "Bad Request: You do not have permission to grant someone ADMIN in this group" });
            return;
        }
        if (!memberMembership || memberMembership.role === "ADMIN") {
            res.status(400).json({ error: "Bad Request: User is already an admin or not a member of this group" });
            return;
        }
        yield prismaClient_1.default.group.update({
            where: { id: groupId },
            data: {
                memberships: {
                    update: {
                        where: {
                            user_id_group_id: {
                                user_id: memberId,
                                group_id: groupId,
                            },
                        },
                        data: { role: "ADMIN" },
                    },
                },
            },
        });
        res.status(200).json({ message: "Assigned admin successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in assignAdmin controller", error.message);
        }
        else {
            console.log("Unexpected error in assignAdmin controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.assignAdmin = assignAdmin;
