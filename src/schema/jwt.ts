import mongoose from "mongoose";

export interface User{
    id : string;
    email : string ,
    password : string ,
    created_at: Date,
    created_by :string | null ,
    updated_at: string | null ,
    updated_by:string | null,
}
