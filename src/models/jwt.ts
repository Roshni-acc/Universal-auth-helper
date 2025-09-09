import mongoose, { model, Document } from "mongoose";

export interface IUserModel extends Document {
  email: string;
  password: string;
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
}

const userSchema = new mongoose.Schema<IUserModel>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  created_by: { type: String, default: null },
  updated_at: { type: Date, default: null },
  updated_by: { type: String, default: null },
});


userSchema.set("toJSON", {
  versionKey: false, // remove __v
  transform: (doc: Document, ret: Record<string, any>) => {
    ret._id = ret._id.toString();
    const { _id, ...rest } = ret;
    return { _id, ...rest }; 
  },
});

export const userModel = model<IUserModel>("User", userSchema);
