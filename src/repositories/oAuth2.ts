import mongoose from "mongoose";
import { UserModel, IUser } from "../schema/oAuth2";

const memoryOAuthUsers: Map<string, any> = new Map();

export class UserRepository {
  async findByProvider(provider: string, providerId: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      return UserModel.findOne({ provider, providerId });
    }
    for (const u of memoryOAuthUsers.values()) {
      if (u.provider === provider && u.providerId === providerId) return u;
    }
    return null;
  }

  async findByEmail(email: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      return UserModel.findOne({ email });
    }
    for (const u of memoryOAuthUsers.values()) {
      if (u.email === email) return u;
    }
    return null;
  }

  async findById(id: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      return UserModel.findById(id);
    }
    return memoryOAuthUsers.get(id) || null;
  }

  async create(user: Partial<IUser>): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      return UserModel.create(user);
    }
    const id = "oauth_" + Math.random().toString(36).substring(2, 10);
    const newUser = {
      _id: id,
      ...user,
      toObject: () => ({ _id: id, ...user })
    };
    memoryOAuthUsers.set(id, newUser);
    return newUser;
  }
}

