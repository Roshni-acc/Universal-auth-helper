import mongoose from "mongoose";
import { userModel, IUserModel } from "../models/jwt";
import { User } from "../schema/jwt";

// Memory store fallback when MongoDB is not connected
const memoryUsers: Map<string, any> = new Map();

export class JwtRepository {
  async create(user: User): Promise<any> {
    if (mongoose.connection.readyState === 1) {
      return userModel.create(user);
    }
    
    // In-memory fallback
    const id = "usr_" + Math.random().toString(36).substring(2, 10);
    const newUser = {
      _id: id,
      ...user,
      created_at: user.created_at || new Date(),
      toObject: () => ({ _id: id, ...user })
    };
    memoryUsers.set(id, newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      return userModel.findOne({ email });
    }
    
    for (const u of memoryUsers.values()) {
      if (u.email === email) return u;
    }
    return null;
  }

  async findById(id: string): Promise<any | null> {
    if (mongoose.connection.readyState === 1) {
      return userModel.findById(id);
    }
    
    return memoryUsers.get(id) || null;
  }

  async count(): Promise<number> {
    if (mongoose.connection.readyState === 1) {
      return userModel.countDocuments();
    }
    return memoryUsers.size;
  }
}

