import {JwtRepository} from "../repositories/jwt"
import {User} from "../schema/jwt"
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export class JwtService{
private  jwtrepo = new JwtRepository();
  async register(data: { email: string; password: string; name: string }) {
    const existingUser = await this.jwtrepo.findByEmail(data.email);
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser: User = {
      id: new mongoose.Types.ObjectId().toString(),
      email: data.email,
      password: hashedPassword,
      created_at: new Date(),
      created_by: null,
      updated_at: null,
      updated_by: null,
    };

    return this.jwtrepo.create(newUser);
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.jwtrepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid password");

    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
  }

  async getProfile(userId: string) {
    const user = await this.jwtrepo.findById(userId);
    if (!user) throw new Error("User not found");
    return { id: user.id, email: user.email };
  }
}