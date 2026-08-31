import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";

import { UniversalAuth } from "./sdk/UniversalAuth";
import { JwtController } from "./controllers/jwt";
import { auth2Controller } from "./controllers/oAuth2";
import { getAuth2Config } from "./config/auth2config";
import { checkBlacklist } from "./middleware/blacklist";
import { authMiddleware } from "./middleware/jwt";
import { BlacklistRepository } from "./repositories/blacklist";
import { JwtRepository } from "./repositories/jwt";

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Initialize Universal Auth Engine & SDK Middleware
UniversalAuth.init(app, {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "universal_auth_default_jwt_secret_2026",
  sessionSecret: process.env.SESSION_SECRET || "universal_auth_default_session_secret",
  enableUI: true
});

const jwtController = new JwtController();
const jwtRepo = new JwtRepository();
const blacklistRepo = new BlacklistRepository();

// ==========================================
// 1. JWT AUTHENTICATION ROUTES
// ==========================================
app.post("/register", (req: Request, res: Response) =>
  jwtController.register(req, res)
);

app.post("/login", (req: Request, res: Response) =>
  jwtController.login(req, res)
);

app.get("/profile", checkBlacklist, authMiddleware, (req: Request, res: Response) =>
  jwtController.profile(req, res)
);

app.post("/logout", checkBlacklist, (req: Request, res: Response) =>
  jwtController.logout(req, res)
);

// ==========================================
// 2. SESSION-BASED AUTHENTICATION ROUTES
// ==========================================
app.post("/session/login", (req: Request, res: Response) => {
  if (req.session) {
    (req.session as any).user = {
      id: "sess_" + Math.random().toString(36).substring(2, 9),
      name: req.body.name || "Session User",
      email: req.body.email || "session@example.com",
      loggedInAt: new Date()
    };
  }
  res.json({
    status: true,
    message: "Session cookie created successfully",
    user: (req.session as any)?.user
  });
});

app.get("/session/profile", (req: Request, res: Response) => {
  if (req.session && (req.session as any).user) {
    res.json({ status: true, user: (req.session as any).user });
  } else {
    res.status(401).json({ status: false, message: "No active session cookie found" });
  }
});

app.post("/session/logout", (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ status: false, message: "Session destruction failed" });
      res.clearCookie("connect.sid");
      res.json({ status: true, message: "Session destroyed and cookie cleared" });
    });
  } else {
    res.json({ status: true, message: "No active session" });
  }
});

// ==========================================
// 3. OAUTH2 SOCIAL AUTHENTICATION ROUTES
// ==========================================
app.use("/auth", auth2Controller(getAuth2Config()));

// ==========================================
// 4. SYSTEM STATS & METRICS API
// ==========================================
app.get("/api/stats", async (_req: Request, res: Response) => {
  try {
    const usersCount = await jwtRepo.count();
    const blacklistCount = await blacklistRepo.count();
    const isMongoConnected = mongoose.connection.readyState === 1;

    res.json({
      status: true,
      dbConnected: isMongoConnected,
      usersCount,
      blacklistCount,
      environment: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.floor(process.uptime())
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      jwtEngine: "active",
      oauth2Module: "active",
      sessionStore: "active"
    }
  });
});

// ==========================================
// 5. RENDER KEEP-ALIVE PING ENDPOINT & SERVICE
// ==========================================
app.get(["/ping", "/api/ping"], (_req: Request, res: Response) => {
  res.json({
    status: "pong",
    message: "Server is awake and active",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Auto-Ping Background Worker (Fires every 5 minutes = 300,000 ms to prevent Render free-tier sleep)
const PING_INTERVAL_MS = 5 * 60 * 1000;
let pingCount = 0;

setInterval(async () => {
  try {
    pingCount++;
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const http = require("http");
    const https = require("https");
    const client = serverUrl.startsWith("https") ? https : http;

    client.get(`${serverUrl}/ping`, (res: any) => {
      console.log(`📡 [Render Keep-Alive #${pingCount}] Self-ping to ${serverUrl}/ping - Status ${res.statusCode}`);
    }).on("error", (err: any) => {
      console.log(`📡 [Render Keep-Alive #${pingCount}] Heartbeat ping tick active (${err.message})`);
    });
  } catch (e: any) {
    console.warn("[Keep-Alive] Ping tick handler warning:", e.message);
  }
}, PING_INTERVAL_MS);

// ==========================================
// SERVER STARTUP
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 [UniversalAuth] Studio running on http://localhost:${PORT}`);
  console.log(`⏱️ [Render Keep-Alive] 5-minute auto-ping service active.`);
});


// Re-export for package / SDK consumers
export { UniversalAuth } from "./sdk/UniversalAuth";
export { JwtController } from "./controllers/jwt";
export { auth2Controller } from "./controllers/oAuth2";
export { JwtService } from "./services/jwt";
export { Auth2Service } from "./services/oauth2";
export { SessionService } from "./services/session";
