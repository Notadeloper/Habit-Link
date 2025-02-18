import { RequestHandler } from "express";
import prisma from "../prismaClient";
import { Prisma } from "@prisma/client";
import { CreateGroupRequestBody, UpdateGroupRequestBody } from "../interfaces/Group";
import { getPeriodKey, isConsecutive } from "./habitController";


export const createGroup: RequestHandler = async (req, res) => {
    try {
        // Empty string if description omitted
        // Cannot modify frequency_count and frequency_period after creation (otherwise this would affect individual habits)
        const { name, description = "", memberIds, habitTitle, frequency_count, frequency_period, goalStreak, dayStart } = req.body as CreateGroupRequestBody;
        const creatorId = req.user?.id;

        if (!creatorId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        if (!name) {
            res.status(400).json({ error: "Name is required" });
            return;
        }

        if (!habitTitle || frequency_count === undefined || !frequency_period || !dayStart) {
            res.status(400).json({ error: "Missing required group habit fields: habitTitle, frequency_count, frequency_period, dayStart" });
            return;
        }

        const additionalMemberIds = memberIds ? memberIds.filter((id: string) => id !== creatorId) : [];
        const participantUserIds = [creatorId, ...additionalMemberIds];

        const newGroup = await prisma.group.create({
            data: {
                name,
                description,
                groupHabit: {
                    create: {
                        title: habitTitle,
                        frequency_count: Number(frequency_count),
                        frequency_period,
                        goalStreak: goalStreak !== undefined ? Number(goalStreak) : undefined,
                        dayStart
                    },
                },
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
                        participants: {
                            create: participantUserIds.map((id) => ({
                                user: { connect: { id } },
                            })),
                        },
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

// Also return max streak here
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
                conversation: true,
                groupHabit: {
                    include: {
                        participations: {
                            include: {
                                habit: {
                                    include: {
                                        habitTrackings: true
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

        const groupStreak = await recalculateGroupCurrentStreak(groupId);
        
        res.status(200).json({ group, groupStreak: groupStreak });
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getGroupInfoById controller", error.message);
        } else {
            console.log("Unexpected error in getGroupInfoById controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}

// UPDATE THIS FUNCTION
export const updateGroup: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { groupId } = req.params;
        const { name, description, habitTitle, frequency_count, frequency_period, goalStreak, dayStart } = req.body as UpdateGroupRequestBody

        if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user found in request" });
            return;
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { 
                memberships: true,
                groupHabit: true
            },
        });

        if (!group || !group.groupHabit) {
            res.status(404).json({ error: "Group or group habit not found" });
            return;
        }

        const inviterMembership = group.memberships.find((membership) => membership.user_id === userId);
        
        if (!inviterMembership || inviterMembership.role !== "ADMIN") {
            res.status(403).json({ error: "Not authorized to update this group" });
            return;
        }
        const updateData: Prisma.GroupUpdateInput = {};
        if (name) updateData.name = { set: name };
        if (description) updateData.description = { set: description };
    
        const groupHabitUpdate: Prisma.GroupHabitUpdateWithoutGroupInput = {};
        if (habitTitle) groupHabitUpdate.title = { set: habitTitle };
        if (frequency_count !== undefined) groupHabitUpdate.frequency_count = { set: frequency_count };
        if (frequency_period) groupHabitUpdate.frequency_period = { set: frequency_period };
        if (goalStreak !== undefined) groupHabitUpdate.goalStreak = { set: goalStreak };
    
        updateData.groupHabit = { update: groupHabitUpdate };
    
        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: updateData,
            include: {
                memberships: { include: { user: true } },
                conversation: true,
                groupHabit: true,
            },
        });
    
        res.status(200).json({ updatedGroup });
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
            include: { 
                memberships: true, conversation: true 
            },
        });

        if (!group || !group.conversation) {
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

        const [newMembership, newParticipant] = await prisma.$transaction([
            prisma.membership.create({
                data: {
                    group: { connect: { id: groupId } },
                    user: { connect: { id: memberId } },
                    role: "USER",
                },
            }),
            prisma.conversationParticipant.create({
                data: {
                    conversation: { connect: { id: group.conversation.id } },
                    user: { connect: { id: memberId } },
                },
            }),
        ]);

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
            include: { 
                memberships: true, 
                conversation: true 
            },
        });

        if (!group || !group.conversation) {
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

        await prisma.$transaction([
            prisma.membership.delete({
                where: {
                    user_id_group_id: { user_id: memberId, group_id: groupId },
                },
            }),
            prisma.conversationParticipant.delete({
                where: {
                    conversationId_userId: {
                        conversationId: group.conversation.id,
                        userId: memberId,
                    },
                },
            }),
          ]);

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
            include: { 
                memberships: true,
                conversation: true
            },
        });

        if (!group || !group.conversation) {
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

        await prisma.$transaction([
            prisma.membership.delete({
                where: { user_id_group_id: { user_id: userId, group_id: groupId } },
            }),
            prisma.conversationParticipant.delete({
                where: {
                    conversationId_userId: {
                        conversationId: group.conversation.id,
                        userId: userId,
                    },
                },
            }),
          ]);
      

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

export const assignHabit: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { groupId } = req.params;
        const { habitId } = req.body;

        if (!userId) {
            res.status(400).json({ error: "Bad Request: User ID is required" });
            return;
        }

        if (!habitId) {
            res.status(400).json({ error: "Bad Request: Habit ID is required" });
            return;
        }

        if (!groupId) {
            res.status(400).json({ error: "Bad Request: Group ID is required" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { habits: true },
        });

        if (!user) {
            res.status(401).json({ error: "Unauthorized: User not found" });
            return;
        }

        if (!user.habits.some((habit) => habit.id === habitId)) {
            res.status(400).json({ error: "The provided habit does not belong to the user" });
            return;
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                groupHabit: {
                    include: {
                        participations: true
                    }
                }
            }
        });

        if (!group || !group.groupHabit) {
            res.status(404).json({ error: "Group or its challenge habit not found" });
            return;
        }
    
        const existingParticipation = await prisma.habitParticipation.findUnique({
            where: {
                userId_groupHabitId: { userId, groupHabitId: group.groupHabit.id },
            },
        });
    
        let participation;
        if (existingParticipation) {
            participation = await prisma.habitParticipation.update({
                where: { userId_groupHabitId: { userId, groupHabitId: group.groupHabit.id } },
                data: { habit: { connect: { id: habitId } } },
            });
        } else {
            participation = await prisma.habitParticipation.create({
                data: {
                user: { connect: { id: userId } },
                habit: { connect: { id: habitId } },
                groupHabit: { connect: { id: group.groupHabit.id } },
                },
            });
        }
    
        res.status(200).json( {message: "Habit assigned to group challenge successfully", participation });

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in assignHabit controller", error.message);
        } else {
            console.log("Unexpected error in assignHabit controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const getParticipatingHabitUsers: RequestHandler = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { groupId } = req.params;
    
        if (!userId) {
            res.status(400).json({ error: "Bad Request: User ID is required" });
            return;
        }
        if (!groupId) {
            res.status(400).json({ error: "Bad Request: Group ID is required" });
            return;
        }
    
        const group = await prisma.group.findUnique({
          where: { id: groupId },
          include: {
            memberships: true,
            groupHabit: {
              include: {
                participations: {
                  include: {
                    user: true,
                  },
                },
              },
            },
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
    
        if (!group.groupHabit) {
            res.status(404).json({ error: "Group challenge habit not found" });
            return
        }
    
        const participants = group.groupHabit.participations.map((participation) => participation.user);
    
        res.status(200).json({ participants })
    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in assignAdmin controller", error.message);
        } else {
            console.log("Unexpected error in assignAdmin controller", error);
        }     
        res.status(500).json({ error: 'Internal server error' });
    }
}


export async function recalculateGroupCurrentStreak(groupId: string): Promise<number> {
    // 1. Fetch group with its challenge habit and participations.
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            groupHabit: {
                include: {
                    participations: {
                        include: {
                            habit: {
                                include: {
                                    habitTrackings: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
  
    if (!group || !group.groupHabit) {
        throw new Error("Group or group challenge habit not found.");
    }
  
    const { frequency_count, frequency_period, dayStart } = group.groupHabit;
    const totalMembers = group.groupHabit.participations.length;
    if (totalMembers === 0) {
        return 0;
    }
  
    const userPeriodCounts: Map<string, Map<string, number>> = new Map();
    for (const participation of group.groupHabit.participations) {
        const habit = participation.habit;
        if (habit.habitTrackings) {
            for (const tracking of habit.habitTrackings) {
                const entryDate = new Date(tracking.date);
                const periodKey = getPeriodKey(entryDate, frequency_period, dayStart);
                if (!userPeriodCounts.has(participation.userId)) {
                    userPeriodCounts.set(participation.userId, new Map());
                }
                const periodMap = userPeriodCounts.get(participation.userId)!;
                periodMap.set(periodKey, (periodMap.get(periodKey) || 0) + 1);
            }
        }
    }
  
    const periodSuccess: Map<string, number> = new Map();
    for (const [, periodMap] of userPeriodCounts.entries()) {
        for (const [periodKey, count] of periodMap.entries()) {
            if (count >= frequency_count) {
                periodSuccess.set(periodKey, (periodSuccess.get(periodKey) || 0) + 1);
            }
        }
    }
  
    const successfulPeriods: string[] = [];
    for (const [periodKey, successCount] of periodSuccess.entries()) {
        if (successCount === totalMembers) {
            successfulPeriods.push(periodKey);
        }
    }
  
    successfulPeriods.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
    const currentPeriodKey = getPeriodKey(new Date(), frequency_period, dayStart);
    let currentStreak = 0;
    if (successfulPeriods.length > 0 && successfulPeriods[0] === currentPeriodKey) {
        currentStreak = 1;
        for (let i = 1; i < successfulPeriods.length; i++) {
            if (isConsecutive(successfulPeriods[i - 1], successfulPeriods[i], frequency_period)) {
                currentStreak++;
            } else {
                break;
            }
        }
    }
    return currentStreak;
  }