import mongoose from "mongoose";

export interface User{
    _id?: mongoose.Types.ObjectId;
    email : string ,
    password : string ,
    created_at: Date,
    created_by :string | null ,
    updated_at: string | null ,
    updated_by:string | null,
}
