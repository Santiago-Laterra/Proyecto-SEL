import { Schema, model } from 'mongoose';
import { IUser } from '../interface/IUser';

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastSessionId: { type: String, default: null },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client'
  },
  createdAt: { type: Date, default: Date.now },

});

export const User = model<IUser>('User', userSchema);