// This was the only way i could get it read the types and work??
/// <reference path="./types/express.d.ts" />
import express, {Request, Response} from "express";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import groupRoutes from "./routes/groupRoutes";
import habitRoutes from "./routes/habitRoutes";

const app = express();

app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser());


app.get("/", (req: Request, res: Response) => {
    res.send("Server is ready");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/habit", habitRoutes);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});