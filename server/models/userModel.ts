import mongoose, { Schema, Document } from "mongoose";

export interface IUser {
  name: string;
  isAdmin: boolean;
}

interface IUserAuthenticationInfo {
  password: string;
}

export interface IAuthenticationRequest extends Document {
  User: IUser;
  Secret: IUserAuthenticationInfo;
}

const userSchema = new Schema<IAuthenticationRequest>({
  User: {
    name: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, required: true },
  },
  Secret: {
    password: { type: String, required: true },
  },
});

export const UserDB = mongoose.model<IAuthenticationRequest>(
  "Users",
  userSchema,
);
