import express, { Application, Request, Response, NextFunction } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";

import { JwtController } from "../controllers/jwt";
import { auth2Controller } from "../controllers/oAuth2";
import { getAuth2Config, ProviderConfig } from "../config/auth2config";
import { checkBlacklist } from "../middleware/blacklist";
import { authMiddleware } from "../middleware/jwt";

export interface UniversalAuthOptions {
  mongoUri?: string;
  jwtSecret?: string;
  sessionSecret?: string;
  enableOAuth?: boolean;
  enableUI?: boolean;
  oauthConfig?: { [key: string]: ProviderConfig };
}

export class UniversalAuth {
  private static instance: UniversalAuth;
  private jwtController: JwtController;
  private isMongoConnected: boolean = false;

  constructor() {
    this.jwtController = new JwtController();
  }

  public static getInstance(): UniversalAuth {
    if (!UniversalAuth.instance) {
      UniversalAuth.instance = new UniversalAuth();
    }
    return UniversalAuth.instance;
  }

  /**
   * Initializes UniversalAuth middleware and routes into an Express Application
   */
  public static init(app: Application, options: UniversalAuthOptions = {}): UniversalAuth {
    const instance = UniversalAuth.getInstance();
    const mongoUri = options.mongoUri || process.env.MONGO_URI;
    const jwtSecret = options.jwtSecret || process.env.JWT_SECRET || "universal_auth_default_jwt_secret_2026";
    const sessionSecret = options.sessionSecret || process.env.SESSION_SECRET || "universal_auth_default_session_secret";

    process.env.JWT_SECRET = jwtSecret;
    process.env.SESSION_SECRET = sessionSecret;

    // 1. Mongoose Connection Setup
    if (mongoUri) {
      mongoose
        .connect(mongoUri)
        .then(() => {
          instance.isMongoConnected = true;
          console.log("✅ [UniversalAuth] Connected to MongoDB Atlas");
        })
        .catch((err) => {
          instance.isMongoConnected = false;
          console.warn("⚠️ [UniversalAuth] MongoDB connection failed. Running in resilient Memory Store mode.", err.message);
        });
    } else {
      console.log("ℹ️ [UniversalAuth] No MONGO_URI provided. Running in resilient Memory Store mode.");
    }

    // 2. Base Express Middlewares & CORS
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      if (req.method === "OPTIONS") {
        return res.sendStatus(200);
      }
      next();
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());


    // 3. Session Middleware
    const sessionStore = mongoUri && instance.isMongoConnected
      ? MongoStore.create({ mongoUrl: mongoUri, collectionName: "sessions" })
      : new session.MemoryStore();

    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
      })
    );

    // 4. Passport OAuth Setup
    app.use(passport.initialize());
    app.use(passport.session());

    // 5. Serve Static Developer Studio UI
    if (options.enableUI !== false) {
      const publicPath = path.resolve(process.cwd(), "public");
      app.use(express.static(publicPath));
    }

    return instance;
  }


  /**
   * Express middleware to authenticate JWT tokens and verify blacklists
   */
  public static jwtMiddleware() {
    return [checkBlacklist, authMiddleware];
  }
}
