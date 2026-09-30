import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);
