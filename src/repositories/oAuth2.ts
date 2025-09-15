import { UserModel, IUser } from "../schema/oAuth2";

export class UserRepository {

  async findByProvider(provider: string,providerId: string): Promise<IUser | null> {
    return UserModel.findOne({ provider, providerId });
  }


  async findByEmail(email:string): Promise<IUser | null>{
    return UserModel.findOne({ email });
  }
  
    async create(user: Partial<IUser>): Promise<IUser> {
    return UserModel.create(user);
  }
}
