import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/prismaClient';

describe("Auth Routes Integration Tests", () => {
    // Optionally clear the database before each test
    beforeEach(async () => {
        await prisma.$executeRawUnsafe(`
            TRUNCATE TABLE "User", "FriendRequest", "Friendship" RESTART IDENTITY CASCADE;
        `);
    });
  
    afterAll(async () => {
        await prisma.$disconnect();  
    });
  
    describe("POST /api/auth/signup", () => {
        it("should create a new user", async () => {
            const newUser = {
                username: "testuser",
                email: "testuser@example.com",
                fullName: "Test User",
                password: "testpassword",
            };
    
            const res = await request(app)
            .post("/api/auth/signup")
            .send(newUser);
    
            expect(res.statusCode).toBe(201);
            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user).toMatchObject({
                username: newUser.username,
                email: newUser.email,
                fullName: newUser.fullName,
            });
            expect(res.body.user).not.toHaveProperty("password");
        });

        it("should create not allow you to create an identical username", async () => {
            const newUser = {
                username: "testuser",
                email: "testuser@example.com",
                fullName: "Test User",
                password: "testpassword",
            };
    
            const res1 = await request(app)
            .post("/api/auth/signup")
            .send(newUser);

            expect(res1.statusCode).toBe(201);

            const dupUser = {
                username: "testuser",
                email: "testeruser2@example.com",
                fullName: "Test User",
                password: "testpassword",
            };
    
            const res2 = await request(app)
            .post("/api/auth/signup")
            .send(dupUser);
    
            expect(res2.statusCode).toBe(409);
        });

        it("should create not allow you to create an identical email", async () => {
            const newUser = {
                username: "testuser",
                email: "testuser@example.com",
                fullName: "Test User",
                password: "testpassword",
            };
    
            const res1 = await request(app)
            .post("/api/auth/signup")
            .send(newUser);

            expect(res1.statusCode).toBe(201);

            const dupUser = {
                username: "testuser2",
                email: "testuser@example.com",
                fullName: "Test User",
                password: "testpassword",
            };
    
            const res2 = await request(app)
            .post("/api/auth/signup")
            .send(dupUser);
    
            expect(res2.statusCode).toBe(409);
        });
    });

    describe("POST /api/auth/login", () => {
        beforeEach(async () => {
          const salt = await require('bcryptjs').genSalt(10);
          const hashedPassword = await require('bcryptjs').hash("testpassword", salt);
          await prisma.user.create({
            data: {
              username: "loginuser",
              email: "loginuser@example.com",
              fullName: "Login User",
              password: hashedPassword,
            },
          });
        });
    
        it("should login with correct credentials", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    usernameOrEmail: "loginuser",
                    password: "testpassword",
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user).toMatchObject({
                username: "loginuser",
                email: "loginuser@example.com",
                fullName: "Login User",
            });

            expect(res.body.user).not.toHaveProperty("password");
        });
    
        it("should ret 404 for incorrect creds", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    usernameOrEmail: "loginuser",
                    password: "wrongpassword",
                });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty("error", "Invalid username or email or password.");
        });
    
        it("should ret 400 if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    usernameOrEmail: "loginuser"
                });

            expect(res.statusCode).toBe(400);
        });
      });
    
      describe("POST /api/auth/logout", () => {
        it("should log out the user and clear JWT cookie", async () => {
            // Signup for valid cookie
            const signupRes = await request(app)
                .post("/api/auth/signup")
                .send({
                    username: "logoutuser",
                    email: "logoutuser@example.com",
                    fullName: "Logout User",
                    password: "testpassword",
                });

            expect(signupRes.statusCode).toBe(201);
            const cookie = signupRes.headers['set-cookie'];
            expect(cookie).toBeDefined();

            // Logout
            const logoutRes = await request(app)
                .post("/api/auth/logout")
                .set("Cookie", cookie);

            expect(logoutRes.statusCode).toBe(200);
            expect(logoutRes.body).toHaveProperty("message", "Logged out successfully");
        });
      });
    
      describe("GET /api/auth/getMe", () => {
        it("should return the current users info", async () => {
            const signupRes = await request(app)
                .post("/api/auth/signup")
                .send({
                    username: "bob",
                    email: "bobbob@example.com",
                    fullName: "BOB",
                    password: "bob...",
                });

            expect(signupRes.statusCode).toBe(201);
            const cookie = signupRes.headers['set-cookie'];
            expect(cookie).toBeDefined();
    
            const res = await request(app)
                .get("/api/auth/getMe")
                .set("Cookie", cookie);

            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty("id");
            expect(res.body.user).toMatchObject({
                username: "bob",
                email: "bobbob@example.com",
                fullName: "BOB",
             });
        });
    
        it("should return 401 if no user is logged in", async () => {
            const res = await request(app).get("/api/auth/getMe");
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("error");
        });
    });
});
