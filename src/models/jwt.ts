import { User } from "../schema/jwt.ts";

export class userModel {
  private users: User[] = [];

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

    async findByIf(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }
}
