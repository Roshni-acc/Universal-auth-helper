// /schema/jwt.ts
import mongoose from "mongoose";

export interface User {
  email: string;
  password: string;
  created_at: Date;
  created_by: string | null;
  updated_at: Date | null;
  updated_by: string | null;
}
