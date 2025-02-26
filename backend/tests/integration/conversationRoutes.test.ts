import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/prismaClient';

describe("Conversation Routes Integration Tests", () => {
    let userCookie: string;
    let signedinUserId: string;
    let friendCookie: string;
    let friendUserId: string;
    let otherCookie: string;
    let otherUserId: string;
    let groupId: string;
    let conversationId: string;

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

        const res6 = await request(app)
            .post(`/api/conversation/${friendUserId}`)
            .set("Cookie", userCookie)
        
        expect(res6.statusCode).toBe(201);
        conversationId = res6.body.conversation.id;
    });
  
    afterAll(async () => {
        await prisma.$disconnect();  
    });
  
    describe("GET /api/conversation/dm", () => {
        it("should return most recent conversations for dm", async () => {
            const res = await request(app)
                .get("/api/conversation/dm")
                .set("Cookie", userCookie)

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("conversations");
            expect(Array.isArray(res.body.conversations)).toBe(true);
            const conversationIds = res.body.conversations.map((conversation: any) => conversation.id);
            expect(conversationIds).toContain(conversationId);
        });

        it("should return most recent conversations for dm for friend", async () => {
            const res = await request(app)
                .get("/api/conversation/dm")
                .set("Cookie", friendCookie)

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("conversations");
            expect(Array.isArray(res.body.conversations)).toBe(true);
            const conversationIds = res.body.conversations.map((conversation: any) => conversation.id);
            expect(conversationIds).toContain(conversationId);
        });
    });

    describe("GET /api/conversation/:conversationId", () => {
        it("should return the details of a specific conversation", async () => {
            const res = await request(app)
                .get(`/api/conversation/${conversationId}`)
                .set("Cookie", userCookie)
        

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("conversation");
            expect(res.body.conversation).toHaveProperty("id", conversationId);
            expect(res.body.conversation.messages).toHaveLength(0);
          });
    });

    describe("POST /api/conversation/:userId", () => {
        it("should successfully create a new conversation", async () => {
            const res = await request(app)
                .post(`/api/conversation/${otherUserId}`)
                .set("Cookie", userCookie)

            expect(res.statusCode).toBe(201);
            const otherConversationId = res.body.conversation.id;

            const res2 = await request(app)
                .get("/api/conversation/dm")
                .set("Cookie", userCookie)

            expect(res2.statusCode).toBe(200);
            expect(res2.body).toHaveProperty("conversations");
            expect(Array.isArray(res2.body.conversations)).toBe(true);
            const conversationIds = res2.body.conversations.map((conversation: any) => conversation.id);
            expect(conversationIds).toContain(conversationId);
            expect(conversationIds).toContain(otherConversationId);
        });

        it("should not create another conversation when there already is one", async () => {
            const res = await request(app)
                .post(`/api/conversation/${friendUserId}`)
                .set("Cookie", userCookie)

            expect(res.statusCode).toBe(400);
        });
    });

    describe("POST /api/message/:conversationId", () => {
        it("should correctly send a new message", async () => {
            const content = "Hello, WORLD!";
            const res = await request(app)
                .post(`/api/conversation/message/${conversationId}`)
                .set("Cookie", userCookie)
                .send({ content });
              
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("message");
            expect(res.body.message).toHaveProperty("content", content);
            expect(res.body.message).toHaveProperty("senderId", signedinUserId);
            
            const res2 = await request(app)
              .get(`/api/conversation/${conversationId}`)
              .set("Cookie", userCookie);
            expect(res2.statusCode).toBe(200);
            expect(res2.body.conversation).toHaveProperty("messages");
            expect(Array.isArray(res2.body.conversation.messages)).toBe(true);
            expect(res2.body.conversation.messages[0]).toHaveProperty("content", content);
        });

        it("should return 404 if user is not a participant in the conversation", async () => {
            const res = await request(app)
              .post(`/api/conversation/message/${conversationId}`)
              .set("Cookie", otherCookie)
              .send({ content: "Unauthorized message" });
              
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty("error", "Conversation not found or access denied");
        });

        it("should return conversations ordered descending (most recent first)", async () => {
            const res = await request(app)
                .post(`/api/conversation/${otherUserId}`)
                .set("Cookie", userCookie);
            expect(res.statusCode).toBe(201);
            const otherConversationId = res.body.conversation.id;
        
            const messageContent = "This is the latest message!!!";
            const res2 = await request(app)
                .post(`/api/conversation/message/${conversationId}`)
                .set("Cookie", userCookie)
                .send({ content: messageContent });

            expect(res2.statusCode).toBe(201);
        
            const res3 = await request(app)
                .get("/api/conversation/dm")
                .set("Cookie", userCookie);

            expect(res3.statusCode).toBe(200);
            expect(res3.body).toHaveProperty("conversations");
            expect(Array.isArray(res3.body.conversations)).toBe(true);
        
            const conversationIds = res3.body.conversations.map((conv: any) => conv.id);

            expect(conversationIds[0]).toBe(conversationId);
            expect(conversationIds).toContain(conversationId);
            expect(conversationIds).toContain(otherConversationId);
          });
    });
});