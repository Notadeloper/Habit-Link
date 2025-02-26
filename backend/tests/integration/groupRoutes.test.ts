import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/prismaClient';
import exp from 'constants';

describe("Group Routes Integration Tests", () => {
    let userCookie: string;
    let signedinUserId: string;
    let friendCookie: string;
    let friendUserId: string;
    let otherCookie: string;
    let otherUserId: string;
    let groupId: string;

    // Optionally clear the database before each test
    beforeEach(async () => {
        await prisma.$executeRawUnsafe(`
            TRUNCATE TABLE "User", "Membership", "FriendRequest", "Friendship", "Group", "Habit", "Conversation", "ConversationParticipant", "Message", "GroupHabit", "HabitTracking", "Streak" RESTART IDENTITY CASCADE;
        `);

        const res1 = await request(app)
            .post("/api/auth/signup")
            .send({
                username: "eddy",
                email: "edison.liang137@gmail.com",
                fullName: "Edison Liang",
                password: "edison",
            });
        userCookie = res1.headers['set-cookie'];
        signedinUserId = res1.body.user.id;

        const res2 = await request(app)
            .post("/api/auth/signup")
            .send({
                username: "johndoe",
                email: "johndoe@email.com",
                fullName: "John Doe",
                password: "123456",
            });

        friendCookie = res2.headers['set-cookie'];
        friendUserId = res2.body.user.id;

        const res3 = await request(app)
            .post("/api/auth/signup")
            .send({
                username: "janedoe",
                email: "janedoe@email.com",
                fullName: "Jane Doe",
                password: "123456",
            });

        otherCookie = res3.headers['set-cookie'];
        otherUserId = res3.body.user.id;

        const res4 = await request(app)
            .post("/api/user/friend-requests")
            .set("Cookie", userCookie)
            .send({ userId: friendUserId });

        const requestId = res4.body.id;

        await request(app)
            .put(`/api/user/friend-requests/${requestId}/accept`)
            .set("Cookie", friendCookie)

        const res5 = await request(app)
            .post("/api/group")
            .set("Cookie", userCookie)
            .send({
                name: "Test Group",
                description: "Test Description",
                memberIds: [friendUserId],
                habitTitle: "Test Habit",
                frequency_count: 1,
                frequency_period: "day",
                dayStart: "05:00"
            });

        expect(res5.statusCode).toBe(201);

        groupId = res5.body.group.id;
    });
  
    afterAll(async () => {
        await prisma.$disconnect();  
    });
  
    describe("POST /api/group", () => {
        it("should create a new group", async () => {
            const res = await request(app)
            .post("/api/group")
            .set("Cookie", userCookie)
            .send({
                name: "Gym Group",
                description: "Gym Description",
                memberIds: [otherUserId],
                habitTitle: "Gym Habit",
                frequency_count: 1,
                frequency_period: "week",
                dayStart: "08:00"
            });

            expect(res.statusCode).toBe(201);
        });

        it("cannot create a new group with missing params", async () => {
            const res = await request(app)
            .post("/api/group")
            .set("Cookie", userCookie)
            .send({
                description: "Test Description",
                members: [otherUserId]
            });

            expect(res.statusCode).toBe(400);
        });

    });

    describe("GET /api/groups", () => {
        it("should correctly return the groups the user is in", async () => {
            const res = await request(app)
                .post("/api/group")
                .set("Cookie", userCookie)
                .send({
                    name: "Gym Group",
                    description: "Gym Description",
                    memberIds: [otherUserId],
                    habitTitle: "Gym Habit",
                    frequency_count: 1,
                    frequency_period: "week",
                    dayStart: "08:00"
                });

            expect(res.statusCode).toBe(201);
            const otherGroupId = res.body.group.id;

            const res2 = await request(app)
                .get("/api/group")
                .set("Cookie", userCookie);

            expect(res2.statusCode).toBe(200);
            expect(res2.body).toHaveProperty("groups");
            expect(Array.isArray(res2.body.groups)).toBe(true);
            const groupIds = res2.body.groups.map((group: any) => group.id);
            expect(groupIds).toContain(groupId);
            expect(groupIds).toContain(otherGroupId);
          });
    });

    describe("GET /api/group/:groupId", () => {
        it("should correctly return a specific group that the user is in", async () => {
            const res = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", friendCookie);

            expect(res.statusCode).toBe(200);
            const returnedGroupId = res.body.group.id;
            expect(returnedGroupId).toBe(groupId);
        });

        it("should not return a group that the user is not in", async () => {
            const res = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", otherCookie);

            expect(res.statusCode).toBe(403);
        });
    });

    describe("PUT /api/group/:groupId", () => {
        it("should correctly update the group when admin", async () => {
            const res = await request(app)
                .put(`/api/group/${groupId}`)
                .set("Cookie", userCookie)
                .send({
                    name: "Updated Group Name",
                    description: "Updated Group Description"
                });
            
            expect(res.statusCode).toBe(200);
            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", userCookie);
            
            expect(res2.statusCode).toBe(200);
            expect(res2.body).toHaveProperty("group");
            expect(res2.body.group).toHaveProperty("name", "Updated Group Name");
        });

        it("should not update the group when not admin", async () => {
            const res = await request(app)
                .put(`/api/group/${groupId}`)
                .set("Cookie", friendCookie)
                .send({
                    name: "Updated Group Name",
                    description: "Updated Group Description"
                });

            expect(res.statusCode).toBe(403);
        });
    });

    describe("DELETE /api/group/:groupId", () => {
        it("should correctly delete the group when admin", async () => {
            const res = await request(app)
                .delete(`/api/group/${groupId}`)
                .set("Cookie", userCookie)
            
            expect(res.statusCode).toBe(200);
            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", userCookie);
            
            expect(res2.statusCode).toBe(404);
        });

        it("should not delete the group when not admin", async () => {
            const res = await request(app)
                .delete(`/api/group/${groupId}`)
                .set("Cookie", friendCookie)

            expect(res.statusCode).toBe(403);

            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", userCookie);

            expect(res2.statusCode).toBe(200);
        });
    });

    describe("POST /api/group/:groupId/members", () => {
        it("admin can invite members to the group", async () => {
            const res = await request(app)
                .post(`/api/group/${groupId}/members`)
                .set("Cookie", userCookie)
                .send({ memberId: otherUserId });
            
            expect(res.statusCode).toBe(201);
            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", userCookie);
            
            expect(res2.statusCode).toBe(200);
            const membershipUserIds = res2.body.group.memberships.map((membership: any) => membership.user.id);
            expect(membershipUserIds).toContain(otherUserId);
        });

        it("member cannot invite people to the group", async () => {
            const res = await request(app)
                .post(`/api/group/${groupId}/members`)
                .set("Cookie", friendCookie)
                .send({ memberId: otherUserId });

            expect(res.statusCode).toBe(403);

            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", userCookie);

            expect(res2.statusCode).toBe(200);
            const membershipUserIds = res2.body.group.memberships.map((membership: any) => membership.user.id);
            expect(membershipUserIds).not.toContain(otherUserId);
        });
    });

    describe("DELETE /api/group/:groupId/members/:memberId", () => {
        it("admin can remove members from group", async () => {
            const res = await request(app)
                .delete(`/api/group/${groupId}/members/${friendUserId}`)
                .set("Cookie", userCookie);
            
            expect(res.statusCode).toBe(200);
            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", userCookie);
            
            expect(res2.statusCode).toBe(200);
            const membershipUserIds = res2.body.group.memberships.map((membership: any) => membership.user.id);
            expect(membershipUserIds).not.toContain(friendUserId);
        });

        it("member cannot remove people from group", async () => {
            const res = await request(app)
                .delete(`/api/group/${groupId}/members/${signedinUserId}`)
                .set("Cookie", friendCookie);

            expect(res.statusCode).toBe(403);

            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", friendCookie);

            expect(res2.statusCode).toBe(200);
            const membershipUserIds = res2.body.group.memberships.map((membership: any) => membership.user.id);
            expect(membershipUserIds).toContain(signedinUserId);
        });
    });

    describe("POST /api/group/:groupId/leave and PUT /api/group/:groupId/members/:memberId/admin", () => {
        it("can leave group as member", async () => {
            const res = await request(app)
                .post(`/api/group/${groupId}/leave`)
                .set("Cookie", friendCookie);
            
            expect(res.statusCode).toBe(200);
            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", userCookie);
            
            expect(res2.statusCode).toBe(200);
            const membershipUserIds = res2.body.group.memberships.map((membership: any) => membership.user.id);
            expect(membershipUserIds).not.toContain(friendUserId);        
        });

        it("cannot leave group as only admin", async () => {
            const res = await request(app)
                .post(`/api/group/${groupId}/leave`)
                .set("Cookie", userCookie);

            expect(res.statusCode).toBe(400);

            const res2 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", friendCookie);
            
            expect(res2.statusCode).toBe(200);
            const membershipUserIds = res2.body.group.memberships.map((membership: any) => membership.user.id);
            expect(membershipUserIds).toContain(signedinUserId);   
        });

        it("can leave group as admin if there is another admin", async () => {
            const res = await request(app)
                .put(`/api/group/${groupId}/members/${friendUserId}/admin`)
                .set("Cookie", userCookie);

            expect(res.statusCode).toBe(200);

            const res2 = await request(app)
                .post(`/api/group/${groupId}/leave`)
                .set("Cookie", userCookie);

            expect(res2.statusCode).toBe(200);

            const res3 = await request(app)
                .get(`/api/group/${groupId}`)
                .set("Cookie", friendCookie);
            
            expect(res3.statusCode).toBe(200);
            const membershipUserIds = res3.body.group.memberships.map((membership: any) => membership.user.id);
            expect(membershipUserIds).not.toContain(signedinUserId);     
        });
    });
});