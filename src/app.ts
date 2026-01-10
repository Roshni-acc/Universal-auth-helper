import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express, { Application, Request, Response } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";

import { JwtController } from "./controllers/jwt";
import { auth2Controller } from "./controllers/oAuth2";
import { getAuth2Config } from "./config/auth2config";
import { checkBlacklist } from "./middleware/blacklist";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session middleware (required for OAuth2 and session-based auth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_session_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI!,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Passport initialization (for OAuth2)
app.use(passport.initialize());
app.use(passport.session());

// JWT Controller
const jwtController = new JwtController();


// JWT Routes
app.post("/register", (req: Request, res: Response) =>
  jwtController.register(req, res)
);
app.post("/login", (req: Request, res: Response) =>
  jwtController.login(req, res)
);
app.get("/profile", checkBlacklist, (req: Request, res: Response) =>
  jwtController.profile(req, res)
);
app.post("/logout", checkBlacklist, (req: Request, res: Response) =>
  jwtController.logout(req, res)
);

// OAuth2 Routes (mounted at /auth)
app.use("/auth", auth2Controller(getAuth2Config()));

// Session Routes (for session-based auth)
app.post("/session/login", (req: Request, res: Response) => {
  // Simple session-based login
  req.session.user = req.body;
  res.json({ message: "Session login successful", user: req.body });
});

app.get("/session/profile", (req: Request, res: Response) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.post("/session/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Universal Auth Helper API",
    endpoints: {
      jwt: {
        register: "POST /register",
        login: "POST /login",
        profile: "GET /profile (Authorization: Bearer <token>)",
      },
      oauth2: {
        google: "GET /auth/google",
        callback: "GET /auth/google/callback",
        success: "GET /auth/success",
        fail: "GET /auth/fail",
      },
      session: {
        login: "POST /session/login",
        profile: "GET /session/profile",
        logout: "POST /session/logout",
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Re-export for library usage
export { auth2Controller } from "./controllers/oAuth2";
export { Auth2Config } from "./config/auth2config";
export { JwtController } from "./controllers/jwt";
export { JwtService } from "./services/jwt";
export { Auth2Service } from "./services/oauth2";
export { SessionService } from "./services/session";
