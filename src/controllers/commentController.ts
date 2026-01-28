import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Comment from '../models/Comment';

// POST /comment
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, authorId, content } = req.body;
    if (!postId || !authorId || !content) {
      return res.status(400).json({ message: 'postId, authorId and content are required' });
    }

    const comment = await Comment.create({ postId, authorId, content });
    return res.status(201).json(comment);
  } catch (err) {
    if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// GET /comment
export const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    return res.json(comments);
  } catch (err) {
    if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// GET /comment/:id
export const getCommentById = async (req: Request, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    return res.json(comment);
  } catch {
    return res.status(400).json({ message: 'Invalid comment id' });
  }
};

// GET /comment/post/:postId
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
    return res.json(comments);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid post id' });
  }
};

// PUT /comment/:id
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { authorId, content } = req.body;
    if (!authorId || !content) {
      return res.status(400).json({ message: 'authorId and content are required' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    comment.authorId = authorId;
    comment.content = content;
    const updated = await comment.save();

    return res.json(updated);
  } catch {
    return res.status(400).json({ message: 'Invalid comment id' });
  }
};

// DELETE /comment/:id
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Comment deleted' });
  } catch {
    return res.status(400).json({ message: 'Invalid comment id' });
  }
};
