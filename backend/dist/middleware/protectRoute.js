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
exports.protectRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const { JWT_SECRET } = process.env;
const protectRoute = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).json({ error: "Unauthorised: No Token Provided" });
            return;
        }
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded || !decoded.userId) {
            res.status(401).json({ error: "Unauthorised: Invalid Token!" });
            return;
        }
        const fullUser = yield prismaClient_1.default.user.findUnique({ where: { id: decoded.userId } });
        if (!fullUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const { password } = fullUser, userWithoutPassword = __rest(fullUser, ["password"]);
        req.user = userWithoutPassword;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log("Unexpected error", error);
        }
        res.status(500).json({ error: "Invalid Server Error" });
    }
});
exports.protectRoute = protectRoute;
