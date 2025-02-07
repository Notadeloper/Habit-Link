"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.get("/", (req, res) => {
    res.send("Server is ready");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
