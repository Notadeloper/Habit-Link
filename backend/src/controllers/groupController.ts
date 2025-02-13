import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { CreateGroupRequestBody, GroupUpdateData } from "../interfaces/Group";


export const createGroup: RequestHandler = async (req, res) => {
    try {
        // Empty string if description omitted
        const { name, description = "", memberIds } = req.body as CreateGroupRequestBody;
        const creatorId = req.user?.id;

        if (!creatorId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        if (!name) {
            res.status(400).json({ error: "Name is required" });
            return;
        }

        const additionalMemberIds = memberIds ? memberIds.filter((id: string) => id !== creatorId) : [];

        const newGroup = await prisma.group.create({
            data: {
                name,
                description,
                creator: { connect: { id: creatorId } },
                memberships: {
                    create: [
                      { user: { connect: { id: creatorId } }, role: "ADMIN" }, // set creator as ADMIN
                      ...additionalMemberIds.map((id: string) => ({
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
            },
        });

        if (!newGroup) {
            res.status(400).json({ error: "Could not create group" });
            return;
        }

        res.status(201).json({ group: newGroup });

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in createGroup controller", error.message);
        } else {
            console.log("Unexpected error in createGroup controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getGroupsForUser: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        const groups = await prisma.group.findMany({
            where: {
                memberships: {
                    some: {
                        user_id: userId,
                    },
                },
            },
        });

        res.status(200).json({ groups });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getGroupsForUser controller", error.message);
        } else {
            console.log("Unexpected error in getGroupsForUser controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getGroupInfoById: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { groupId } = req.params;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                memberships: true,
                habits: true,
                conversation: true
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
        
        res.status(200).json({ group });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getGroupInfoById controller", error.message);
        } else {
            console.log("Unexpected error in getGroupInfoById controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateGroup: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { groupId } = req.params;
        const { name, description } = req.body;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        const group = await prisma.group.findUnique({
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

        const updateData: GroupUpdateData = {};

        if (name) updateData.name = name;
        if (description) updateData.description = description;

        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: updateData,
        });

        res.status(200).json({ group: updatedGroup });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in updateGroup controller", error.message);
        } else {
            console.log("Unexpected error in updateGroup controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteGroup: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { groupId } = req.params;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { memberships: true },
        });

        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }

        const adminMembership = group.memberships.find(
            (membership) => membership.user_id === userId && membership.role === "ADMIN"
        );
      
        if (!adminMembership) {
            res.status(403).json({ error: "Forbidden: Not authorized to delete this group" });
            return;
        }

        const deletedGroup = await prisma.group.delete({
            where: { id: groupId },
        });

        res.status(200).json({ message: "Group deleted successfully", group: deletedGroup });

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in deleteGroup controller", error.message);
        } else {
            console.log("Unexpected error in deleteGroup controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const addUserToGroup: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
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

        const group = await prisma.group.findUnique({
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

        const newMembership = await prisma.membership.create({
            data: {
              group: { connect: { id: groupId } },
              user: { connect: { id: memberId } },
              role: "USER",
            },
          });

          res.status(201).json({ message: "Member added successfully", membership: newMembership });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in addUserToGroup controller", error.message);
        } else {
            console.log("Unexpected error in addUserToGroup controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const removeMemberFromGroup: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
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

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { memberships: true },
        });

        if (!group) {
            res.status(404).json({ error: "Group not found" });
            return;
        }

        const adminMembership = group.memberships.find(
            (membership) => membership.user_id === userId && membership.role === "ADMIN"
        );
      
        if (!adminMembership) {
            res.status(403).json({ error: "Forbidden: Not authorized to remove this member" });
            return;
        }

        const targetMembership = group.memberships.find((membership) => membership.user_id === memberId);

        if (!targetMembership) {
            res.status(404).json({ error: "Membership not found: User is not a member of this group" });
            return;
        }

        await prisma.membership.delete({
            where: {
              user_id_group_id: { user_id: memberId, group_id: groupId },
            },
        });

        res.status(200).json({ message: "Member removed successfully" });

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in removeMemberFromGroup controller", error.message);
        } else {
            console.log("Unexpected error in removeMemberFromGroup controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const leaveGroup: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { groupId } = req.params;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        if (!groupId) {
            res.status(400).json({ error: "Bad Request: Group ID is required" });
            return;
        }

        const group = await prisma.group.findUnique({
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

        await prisma.membership.delete({
            where: {
                user_id_group_id: {
                    user_id: userId,
                    group_id: groupId,
                },
            },
        });

        res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in leaveGroup controller", error.message);
        } else {
            console.log("Unexpected error in leaveGroup controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const assignAdmin: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { groupId, memberId } = req.params;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        if (!groupId) {
            res.status(400).json({ error: "Bad Request: Group ID is required" });
            return;
        }

        const group = await prisma.group.findUnique({
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

        await prisma.group.update({
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
        })

        res.status(200).json({ message: "Assigned admin successfully" });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in assignAdmin controller", error.message);
        } else {
            console.log("Unexpected error in assignAdmin controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}