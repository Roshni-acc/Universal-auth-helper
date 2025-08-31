// src/repositories/UserRepository.ts
import { User } from "../schema/jwt.ts";
import { userModel } from "../models/jwt.ts";

export class JwtRepository {
  private model = new userModel();

  async create(user: User): Promise<User> {
    return this.model.create(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.model.findByEmail(email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.model.findById(id);
  }
}