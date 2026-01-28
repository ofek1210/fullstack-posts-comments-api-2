import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  content: string;
}

const postSchema: Schema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', postSchema);
