import { Request, Response, NextFunction } from "express";
import { BlacklistRepository } from "../repositories/blacklist";

const blacklistRepo = new BlacklistRepository();

export const checkBlacklist = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
        const isBlacklisted = await blacklistRepo.find(token);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Session expired or already logged out" });
        }
    }

    next();
};
