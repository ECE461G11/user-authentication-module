import mongoose, { Schema, Document } from 'mongoose';
import { Roles } from '../helpers/common';

export interface IUser extends Document {
  username: string;
  password: string;
  role: Roles;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: Object.values(Roles) }
});

export const UserDB = mongoose.model<IUser>('Users', userSchema);