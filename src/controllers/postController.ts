import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Post from '../models/Post';

// POST /post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { authorId, content } = req.body;
    if (!authorId || !content) {
      return res.status(400).json({ message: 'authorId and content are required' });
    }

    const post = await Post.create({ authorId, content });
    return res.status(201).json(post);
  } catch (err) {
    if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// GET /post  (optional query: ?sender=...)
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.query;

    const filter = authorId ? { authorId: authorId as string } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });

    return res.json(posts);
  } catch (err) {
    if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// GET /post/:id
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json(post);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid post id' });
  }
};

// PUT /post/:id
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { authorId, content } = req.body;
    if (!authorId || !content) {
      return res.status(400).json({ message: 'authorId and content are required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    post.authorId = authorId;
    post.content = content;
    const updated = await post.save();

    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid post id' });
  }
};

// DELETE /post/:id
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Post deleted' });
  } catch {
    return res.status(400).json({ message: 'Invalid post id' });
  }
};
