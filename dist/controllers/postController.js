"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getPostById = exports.getPosts = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
// POST /post
const createPost = async (req, res) => {
    try {
        const { authorId, content } = req.body;
        if (!authorId || !content) {
            return res.status(400).json({ message: 'authorId and content are required' });
        }
        const post = await Post_1.default.create({ authorId, content });
        return res.status(201).json(post);
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.createPost = createPost;
// GET /post  (optional query: ?sender=...)
const getPosts = async (req, res) => {
    try {
        const { authorId } = req.query;
        const filter = authorId ? { authorId: authorId } : {};
        const posts = await Post_1.default.find(filter).sort({ createdAt: -1 });
        return res.json(posts);
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.getPosts = getPosts;
// GET /post/:id
const getPostById = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        return res.json(post);
    }
    catch (err) {
        return res.status(400).json({ message: 'Invalid post id' });
    }
};
exports.getPostById = getPostById;
// PUT /post/:id
const updatePost = async (req, res) => {
    try {
        const { authorId, content } = req.body;
        if (!authorId || !content) {
            return res.status(400).json({ message: 'authorId and content are required' });
        }
        const post = await Post_1.default.findById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        if (post.authorId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        post.authorId = authorId;
        post.content = content;
        const updated = await post.save();
        return res.json(updated);
    }
    catch (err) {
        return res.status(400).json({ message: 'Invalid post id' });
    }
};
exports.updatePost = updatePost;
// DELETE /post/:id
const deletePost = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id);
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        if (post.authorId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await Post_1.default.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Post deleted' });
    }
    catch {
        return res.status(400).json({ message: 'Invalid post id' });
    }
};
exports.deletePost = deletePost;
