import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { BlacklistRepository } from "../repositories/blacklist";

const blacklistRepo = new BlacklistRepository();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: false, message: "No token provided", error: "No token provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.split(" ")[1] || authHeader.trim();

    if (!token) {
      return res.status(401).json({ status: false, message: "No token provided", error: "No token provided" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ status: false, error: "JWT_SECRET is not configured" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ status: false, message: "Token expired", error: "Token expired" });
      }
      return res.status(401).json({ status: false, message: "Invalid token", error: "Invalid token" });
    }

    const isBlacklisted = await blacklistRepo.find(token);
    if (isBlacklisted) {
      return res.status(401).json({ status: false, message: "Token has been revoked (logged out)", error: "Token blacklisted" });
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ status: false, message: "Authentication failed", error: err.message });
  }
};

