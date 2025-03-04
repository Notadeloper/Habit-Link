// This was the only way i could get it read the types and work??
/// <reference path="./types/express.d.ts" />
import express, {Request, Response} from "express";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import groupRoutes from "./routes/groupRoutes";
import habitRoutes from "./routes/habitRoutes";
import conversationRoutes from "./routes/conversationRoutes";

const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)
app.use(cookieParser());

// allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8081']; // fallback for dev

app.use(cors({
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.get("/", (req: Request, res: Response) => {
    res.send("Server is ready");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/habit", habitRoutes);
app.use("/api/conversation", conversationRoutes);

export default app;