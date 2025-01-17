import express, {Request, Response} from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.send("Server is ready");
});

app.use("api/auth", authRoutes);

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});