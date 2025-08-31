import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { JwtController } from "./controllers/jwt";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const jwtController = new JwtController();

// Routes
app.post("/register", (req: Request, res: Response) => jwtController.register(req, res));
app.post("/login", (req: Request, res: Response) => jwtController.login(req, res));
app.get("/profile", (req: Request, res: Response) => jwtController.profile(req, res));

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
