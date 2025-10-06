import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email?: string;
  password?: string;   // for JWT users (optional)
  provider?: string;   // e.g. "google", "github"
  providerId?: string; // unique ID from OAuth provider
  name?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: false },
  password: { type: String, required: false },
  provider: { type: String, required: false },
  providerId: { type: String, required: false },
  name: { type: String, required: false },
});

// export const UserModel = mongoose.model<IUser>("User", UserSchema);
export const UserModel =
  mongoose.models.OAuthUser || mongoose.model<IUser>("OAuthUser", UserSchema);
