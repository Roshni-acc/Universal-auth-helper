import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email?: string;
  password?: string;  
  provider?: string;   // e.g. "google", "github"
  providerId?: string; 
  name?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: false },
  password: { type: String, required: false },
  provider: { type: String, required: false },
  providerId: { type: String, required: false },
  name: { type: String, required: false },
});


export const UserModel =
  mongoose.models.OAuthUser || mongoose.model<IUser>("OAuthUser", UserSchema);
