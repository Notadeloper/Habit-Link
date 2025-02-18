"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This was the only way i could get it read the types and work??
/// <reference path="./types/express.d.ts" />
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use((0, cookie_parser_1.default)());
app.get("/", (req, res) => {
    res.send("Server is ready");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/group", groupRoutes_1.default);
app.use("/api/habit", habitRoutes_1.default);
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
