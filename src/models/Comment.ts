import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
}

const commentSchema: Schema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IComment>('Comment', commentSchema);
