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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const generateToken_1 = require("../lib/utils/generateToken");
const SALT_ROUNDS = 10;
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, fullName, password } = req.body;
        const existingUser = yield prismaClient_1.default.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (existingUser) {
            res.status(409).json({ error: 'Username or email already in use.' });
            return;
        }
        const salt = yield bcryptjs_1.default.genSalt(SALT_ROUNDS);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const newUser = yield prismaClient_1.default.user.create({
            data: {
                username,
                email,
                fullName,
                password: hashedPassword,
            },
        });
        (0, generateToken_1.generateTokenAndSetCookie)(newUser.id, res);
        const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        // Token creation and sending logic will be added here
        res.status(201).json({ user: userWithoutPassword });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in signup controller", error.message);
        }
        else {
            console.log("Unexpected error in signup controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { usernameOrEmail, password } = req.body;
        if (!usernameOrEmail || !password) {
            res.status(400).json({ error: 'All fields are required.' });
            return;
        }
        const user = yield prismaClient_1.default.user.findFirst({
            where: {
                OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            },
        });
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, (user === null || user === void 0 ? void 0 : user.password) || "");
        if (!user || !isPasswordCorrect) {
            res.status(404).json({ error: 'Invalid username or email or password.' });
            return;
        }
        (0, generateToken_1.generateTokenAndSetCookie)(user.id, res);
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(200).json({ user: userWithoutPassword });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in login controller", error.message);
        }
        else {
            console.log("Unexpected error in login controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("jwt", {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in logout controller", error.message);
        }
        else {
            console.log("Unexpected error in logout controller", error);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.logout = logout;
