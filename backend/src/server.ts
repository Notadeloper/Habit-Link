import express, {Request, Response} from "express";
import authRoutes from "./routes/authRoutes";

const app = express();

app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded)


app.get("/", (req: Request, res: Response) => {
    res.send("Server is ready");
});

app.use("/api/auth", authRoutes);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});