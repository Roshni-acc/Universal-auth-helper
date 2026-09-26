import { Request, Response, NextFunction } from "express";
import { BlacklistRepository } from "../repositories/blacklist";

const blacklistRepo = new BlacklistRepository();

export const checkBlacklist = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : authHeader?.split(" ")[1];

    if (token) {
        const isBlacklisted = await blacklistRepo.find(token);
        if (isBlacklisted) {
            return res.status(401).json({ status: false, message: "Session expired or already logged out", error: "Token blacklisted" });
        }
    }

    next();
};

