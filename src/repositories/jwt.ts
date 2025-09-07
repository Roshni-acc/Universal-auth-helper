// /repositories/jwt.ts
import { userModel, IUserModel } from "../models/jwt";
import { User } from "../schema/jwt";

export class JwtRepository {
  async create(user: User): Promise<IUserModel> {
    return userModel.create(user);
  }

  async findByEmail(email: string): Promise<IUserModel | null> {
    return userModel.findOne({ email });
  }

  async findById(id: string): Promise<IUserModel | null> {
    return userModel.findById(id);
  }
}
