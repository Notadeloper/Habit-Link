import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/prismaClient';

describe("User Routes Integration Tests", () => {
    let userCookie: string;
    let signedinUserId: string;
    let friendCookie: string;
    let friendUserId: string;
    let otherCookie: string;
    let otherUserId: string;

    // Optionally clear the database before each test
    beforeEach(async () => {
        await prisma.$executeRawUnsafe(`
            TRUNCATE TABLE "User", "Membership", "FriendRequest", "Friendship" RESTART IDENTITY CASCADE;
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
    });
  
    afterAll(async () => {
        await prisma.$disconnect();  
    });
  
    describe("GET /api/user/profile/:userId", () => {
        it("should return a full profile when the logged in user requests their own profile", async () => {
        const res = await request(app)
            .get(`/api/user/profile/${signedinUserId}`)
            .set("Cookie", userCookie);
        
          expect(res.statusCode).toBe(200);
          expect(res.body.user).toHaveProperty("username", "eddy");
          expect(res.body.user).toHaveProperty("email", "edison.liang137@gmail.com");
          expect(res.body.user).toHaveProperty("fullName", "Edison Liang");
          expect(res.body.user).not.toHaveProperty("password");
          expect(res.body.user).toHaveProperty("dayStart", "00:00");
          expect(res.body.user).toHaveProperty("friendships", [friendUserId]);
          expect(res.body.user).toHaveProperty("totalFriendCount", 1);
        });

        it("should return some details when stranger requests a profile", async () => {
            const res = await request(app)
                .get(`/api/user/profile/${signedinUserId}`)
                .set("Cookie", otherCookie);
            
              expect(res.statusCode).toBe(200);
              expect(res.body.user).toHaveProperty("username", "eddy");
              expect(res.body.user).not.toHaveProperty("email");
              expect(res.body.user).not.toHaveProperty("fullName");
              expect(res.body.user).not.toHaveProperty("password");
              expect(res.body.user).not.toHaveProperty("dayStart");
              expect(res.body.user).not.toHaveProperty("friendships");
              expect(res.body.user).toHaveProperty("totalFriendCount", 1);
        });

        it("should return some details including friend count when friend requests a profile", async () => {
            const res = await request(app)
                .get(`/api/user/profile/${signedinUserId}`)
                .set("Cookie", friendCookie);
            
              expect(res.statusCode).toBe(200);
              expect(res.body.user).toHaveProperty("username", "eddy");
              expect(res.body.user).not.toHaveProperty("email");
              expect(res.body.user).toHaveProperty("fullName");
              expect(res.body.user).not.toHaveProperty("password");
              expect(res.body.user).not.toHaveProperty("dayStart");
              expect(res.body.user).toHaveProperty("friendships", [friendUserId]);
              expect(res.body.user).toHaveProperty("totalFriendCount", 1);
        });
    });

    describe("PUT /api/user/profile", () => {
        it("should correctly update non-password profile fields", async () => {
            const updateData = {
                fullName: "Updated Test User",
                email: "updated@example.com",
                username: "updateduser",
                dayStart: "08:00"
            };
        
            const res = await request(app)
                .put("/api/user/profile")
                .set("Cookie", userCookie)
                .send(updateData);
        
            expect(res.statusCode).toBe(200);

            const res2 = await request(app)
                .get(`/api/user/profile/${signedinUserId}`)
                .set("Cookie", userCookie);
            expect(res2.body.user).toHaveProperty("fullName", "Updated Test User");
            expect(res2.body.user).toHaveProperty("email", "updated@example.com");
            expect(res2.body.user).toHaveProperty("username", "updateduser");
            expect(res2.body.user).toHaveProperty("dayStart", "08:00");
            expect(res2.body.user).not.toHaveProperty("password");
          });

        it("should return an error if only one of currentPassword and newPassword is provided", async () => {
            const updateData = {
              currentPassword: "originalPassword"
            };
        
            const res = await request(app)
              .put("/api/user/profile")
              .set("Cookie", userCookie)
              .send(updateData);
        
            expect(res.statusCode).toBe(400);
          });
    });

    describe("GET /api/friends/:userId", () => {
        it("should correctly return friends of a friend", async () => {
            const res = await request(app)
                .get(`/api/user/friends/${friendUserId}`)
                .set("Cookie", userCookie);
        
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("friendList");
            expect(Array.isArray(res.body.friendList)).toBe(true);
            const friendIds = res.body.friendList.map((friend: any) => friend.id);
            expect(friendIds).toContain(signedinUserId);
        });

        it("should not be able to access friends of a non friend", async () => {
            const res = await request(app)
                .get(`/api/user/friends/${otherUserId}`)
                .set("Cookie", userCookie);

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("error", "Cannot view friends");
        });
    });

    describe("GET /api/friends/friend-requests and POST /api/friends/friend-requests", () => {
        it("should correctly display a sent friend request", async () => {
            const res = await request(app)
                .post("/api/user/friend-requests")
                .set("Cookie", userCookie)
                .send({ userId: otherUserId });
        
            expect(res.statusCode).toBe(200);

            const res2 = await request(app)
                .get("/api/user/friend-requests")
                .set("Cookie", otherCookie);

            expect(res2.statusCode).toBe(200);
            expect(res2.body).toHaveProperty("friendRequests");
            expect(res2.body.friendRequests.length).toBe(1);
            expect(res2.body.friendRequests[0]).toHaveProperty("sender_id", signedinUserId);
        });

        it("should not be able to send to someone who is already a friend", async () => {
            const res = await request(app)
                .post("/api/user/friend-requests")
                .set("Cookie", userCookie)
                .send({ userId: friendUserId });
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("error", "Cannot send request to an existing friend");
        });
    });

    describe("POST /api/friends/friend-request/:requestId/accept", () => {
        it("should create a new friendship after accepting a friend request", async () => {
            const res = await request(app)
                .post("/api/user/friend-requests")
                .set("Cookie", userCookie)
                .send({ userId: otherUserId });
            
            expect(res.statusCode).toBe(200);
            const requestId = res.body.id;

            const res2 = await request(app)
                .put(`/api/user/friend-requests/${requestId}/accept`)
                .set("Cookie", otherCookie);
            
            expect(res2.statusCode).toBe(200);

            const res3 = await request(app)
                .get(`/api/user/friends/${otherUserId}`)
                .set("Cookie", userCookie);

            expect(res3.statusCode).toBe(200);

            const friends = res3.body.friendList;
            expect(friends[0]).toHaveProperty("id", signedinUserId);

        });

    });

    describe("DELETE /api/friends/friend-request/:requestId", () => {
        it("should delete the friend request upon rejection", async () => {
            const res = await request(app)
                .post("/api/user/friend-requests")
                .set("Cookie", userCookie)
                .send({ userId: otherUserId });
            
            expect(res.statusCode).toBe(200);
            const requestId = res.body.id;

            const res2 = await request(app)
                .delete(`/api/user/friend-requests/${requestId}`)
                .set("Cookie", otherCookie);

            expect(res2.statusCode).toBe(200);

            const res3 = await request(app)
                .get("/api/user/friend-requests")
                .set("Cookie", otherCookie);
            
            expect(res3.statusCode).toBe(200);
            expect(res3.body.friendRequests.length).toBe(0);

            const res4 = await request(app)
                .get(`/api/user/friends/${otherUserId}`)
                .set("Cookie", otherCookie);

            expect(res4.statusCode).toBe(200);

            const friends = res4.body.friendList;
            expect(friends.length).toBe(0);
        });

    });

    describe("DELETE /api/friends/friend-request/:requestId/reject", () => {
        it("should delete the friend request upon rejection", async () => {
            const res = await request(app)
                .delete(`/api/user/friends/${friendUserId}`)
                .set("Cookie", userCookie);
            
            expect(res.statusCode).toBe(200);

            const res2 = await request(app)
            .get(`/api/user/friends/${signedinUserId}`)
            .set("Cookie", userCookie);

            expect(res2.statusCode).toBe(200);

            const friends = res2.body.friendList;
            expect(friends.length).toBe(0);
        });

    });
});