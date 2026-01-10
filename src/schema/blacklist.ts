import { Schema, model, Document } from "mongoose";

export interface IBlacklist extends Document {
    token: string;
    createdAt: Date;
}

const BlacklistSchema = new Schema<IBlacklist>({
    token: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now, expires: "24h" }, // Auto delete after 24h
});

export const BlacklistModel = model<IBlacklist>("Blacklist", BlacklistSchema);
