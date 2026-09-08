import mongoose from "mongoose";
import { BlacklistModel, IBlacklist } from "../schema/blacklist";

const memoryBlacklist = new Set<string>();

export class BlacklistRepository {
    async add(token: string): Promise<any> {
        if (mongoose.connection.readyState === 1) {
            return BlacklistModel.create({ token });
        }
        memoryBlacklist.add(token);
        return { token, createdAt: new Date() };
    }

    async find(token: string): Promise<any | null> {
        if (mongoose.connection.readyState === 1) {
            return BlacklistModel.findOne({ token });
        }
        return memoryBlacklist.has(token) ? { token } : null;
    }

    async count(): Promise<number> {
        if (mongoose.connection.readyState === 1) {
            return BlacklistModel.countDocuments();
        }
        return memoryBlacklist.size;
    }
}

