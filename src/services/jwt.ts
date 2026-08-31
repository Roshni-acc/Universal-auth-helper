import { JwtRepository } from "../repositories/jwt";
import { User } from "../schema/jwt";
import { BlacklistRepository } from "../repositories/blacklist";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET || "universal_auth_default_jwt_secret_2026";

export class JwtService {
  private jwtrepo = new JwtRepository();
  private blacklistRepo = new BlacklistRepository();

  async register(data: { email: string; password: string; name?: string; role?: string }) {
    const existingUser = await this.jwtrepo.findByEmail(data.email);
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser: any = {
      email: data.email,
      name: data.name || data.email.split("@")[0],
      role: data.role || "user",
      password: hashedPassword,
      created_at: new Date(),
      created_by: null,
      updated_at: null,
      updated_by: null,
    };

    const createdUser = await this.jwtrepo.create(newUser);
    const { password, ...userWithoutPassword } = createdUser.toObject ? createdUser.toObject() : createdUser;
    return userWithoutPassword;
  }

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = await this.jwtrepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid password");

    const userId = user._id?.toString();
    const token = jwt.sign(
      { id: userId, email: user.email, name: user.name || user.email.split("@")[0], role: user.role || "user" },
      getJwtSecret(),
      { expiresIn: "24h" }
    );

    const { password: _, ...userPayload } = user.toObject ? user.toObject() : user;
    return { token, user: userPayload };
  }

  async logout(token: string) {
    await this.blacklistRepo.add(token);
  }

  async getProfile(userId: string) {
    const user = await this.jwtrepo.findById(userId);
    if (!user) throw new Error("User not found");
    const { password, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
    return userWithoutPassword;
  }

  async getUserCount(): Promise<number> {
    return this.jwtrepo.count();
  }

  async getBlacklistCount(): Promise<number> {
    return this.blacklistRepo.count();
  }
}

