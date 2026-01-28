import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  refreshTokens: string[];
}

const userSchema: Schema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    refreshTokens: { type: [String], default: [] }
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).passwordHash;
    delete (ret as any).__v;
    return ret;
  }
});

userSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete (ret as any).passwordHash;
    delete (ret as any).__v;
    return ret;
  }
});

export default mongoose.model<IUser>('User', userSchema);
