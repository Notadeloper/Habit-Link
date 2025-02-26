import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/prismaClient';
import exp from 'constants';

describe("Habit Routes Integration Tests", () => {
    let userCookie: string;
    let signedinUserId: string;
    let friendCookie: string;
    let friendUserId: string;
    let otherCookie: string;
    let otherUserId: string;
    let groupId: string;
    let habitId: string;

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
            .post("/api/habit")
            .set("Cookie", userCookie)
            .send({
                title: "Test Habit",
                description: "Test Description",
                frequency_count: 2,
                frequency_period: "week",
            });

        expect(res6.statusCode).toBe(201);
        habitId = res6.body.habit.id;
    });
  
    afterAll(async () => {
        await prisma.$disconnect();  
    });
  
    describe("POST /api/habit", () => {
        it("should create a new habit", async () => {
            const res = await request(app)
                .post("/api/habit")
                .set("Cookie", friendCookie)
                .send({
                    title: "Daily Leetcode",
                    description: "Leetttt",
                    frequency_count: 1,
                    frequency_period: "week",
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("habit");
            expect(res.body.habit).toMatchObject({
                title: "Daily Leetcode",
                description: "Leetttt",
                frequency_count: 1,
                frequency_period: "week",
            });
        });

    });

    describe("GET /api/habit", () => {
        it("should get the habits that the user is in", async () => {
            const res = await request(app)
                .get("/api/habit")
                .set("Cookie", userCookie)


            expect(res.statusCode).toBe(200);
            expect(res.body.habits).toHaveLength(1);
            expect(res.body.habits[0]).toMatchObject({
                title: "Test Habit",
                description: "Test Description",
                frequency_count: 2,
                frequency_period: "week",
            });
          });
    });

    describe("GET /api/habit/:habitId", () => {
        it("should get a specific habits details", async () => {
            const res = await request(app)
                .get(`/api/habit/${habitId}`)
                .set("Cookie", userCookie)

            expect(res.statusCode).toBe(200);
            expect(res.body.habit).toHaveProperty("id", habitId);
            expect(res.body.habit).toHaveProperty("title", "Test Habit");
            expect(res.body.habit).toHaveProperty("description", "Test Description");
            expect(res.body.habit).toHaveProperty("frequency_count", 2);
            expect(res.body.habit).toHaveProperty("frequency_period", "week");
            expect(Array.isArray(res.body.habit.habitTrackings)).toBe(true);
            expect(res.body.habit.habitTrackings).toHaveLength(0);
        });

        it("should not be able to get the details when logged in as another user", async () => {
            const res = await request(app)
                .get(`/api/habit/${habitId}`)
                .set("Cookie", friendCookie)

            expect(res.statusCode).toBe(404);
        });
    });

    describe("PUT /api/habit/:habitId", () => {
        it("should update a habit if belonging to user", async () => {
            const res = await request(app)
                .get(`/api/habit/${habitId}`)
                .set("Cookie", userCookie)

            expect(res.statusCode).toBe(200);
            expect(res.body.habit).toHaveProperty("id", habitId);
            expect(res.body.habit).toHaveProperty("title", "Test Habit");
            expect(res.body.habit).toHaveProperty("description", "Test Description");
            expect(res.body.habit).toHaveProperty("frequency_count", 2);
            expect(res.body.habit).toHaveProperty("frequency_period", "week");
            expect(Array.isArray(res.body.habit.habitTrackings)).toBe(true);
            expect(res.body.habit.habitTrackings).toHaveLength(0);
        });

        it("should not be able tto update if not for user", async () => {
            const res = await request(app)
                .get(`/api/habit/${habitId}`)
                .set("Cookie", friendCookie)

            expect(res.statusCode).toBe(404);
        });
    });
});