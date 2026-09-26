import { JwtRepository } from "../repositories/jwt";
import { BlacklistRepository } from "../repositories/blacklist";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { RegisterData, JwtServiceOptions } from "../types";

export class JwtService {
  private jwtrepo = new JwtRepository();
  private blacklistRepo = new BlacklistRepository();
  private jwtSecret?: string;
  private expiresIn: string | number;

  constructor(options: JwtServiceOptions = {}) {
    this.jwtSecret = options.jwtSecret || process.env.JWT_SECRET;
    this.expiresIn = options.expiresIn || "24h";
  }

  private getSecret(): string {
    const secret = this.jwtSecret || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is required. Please set process.env.JWT_SECRET or pass jwtSecret in options.");
    }
    return secret;
  }

  async register(data: RegisterData) {
    if (!data) {
      throw new Error("Registration data is required");
    }

    const email = data.email ? String(data.email).trim().toLowerCase() : "";
    const password = data.password;

    if (!email) {
      throw new Error("Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    if (typeof password !== "string" || password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const existingUser = await this.jwtrepo.findByEmail(email);
    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: any = {
      email,
      name: data.name || email.split("@")[0],
      role: data.role || "user",
      password: hashedPassword,
      created_at: new Date(),
      created_by: null,
      updated_at: null,
      updated_by: null,
    };

    const createdUser = await this.jwtrepo.create(newUser);
    const userObj = createdUser.toObject ? createdUser.toObject() : createdUser;
    const { password: _, __v, ...userWithoutPassword } = userObj;
    return userWithoutPassword;
  }

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await this.jwtrepo.findByEmail(normalizedEmail);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Invalid email or password");
    }

    const userId = user._id?.toString() || user.id?.toString();
    const secret = this.getSecret();

    const signOptions: SignOptions = {
      expiresIn: this.expiresIn as any
    };

    const token = jwt.sign(
      { id: userId, email: user.email, name: user.name || user.email.split("@")[0], role: user.role || "user" },
      secret,
      signOptions
    );

    const userObj = user.toObject ? user.toObject() : user;
    const { password: _, __v, ...userPayload } = userObj;
    return { token, user: userPayload };
  }

  async logout(token: string) {
    if (!token) return;
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token.trim();
    await this.blacklistRepo.add(cleanToken);
  }

  async getProfile(userId: string) {
    if (!userId) throw new Error("User ID is required");
    const user = await this.jwtrepo.findById(userId);
    if (!user) throw new Error("User not found");
    const userObj = user.toObject ? user.toObject() : user;
    const { password, __v, ...userWithoutPassword } = userObj;
    return userWithoutPassword;
  }

  async getUserCount(): Promise<number> {
    return this.jwtrepo.count();
  }

  async getBlacklistCount(): Promise<number> {
    return this.blacklistRepo.count();
  }
}


