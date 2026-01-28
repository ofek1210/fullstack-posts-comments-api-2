"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getCommentsByPost = exports.getCommentById = exports.getComments = exports.createComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
// POST /comment
const createComment = async (req, res) => {
    try {
        const { postId, authorId, content } = req.body;
        if (!postId || !authorId || !content) {
            return res.status(400).json({ message: 'postId, authorId and content are required' });
        }
        const comment = await Comment_1.default.create({ postId, authorId, content });
        return res.status(201).json(comment);
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.createComment = createComment;
// GET /comment
const getComments = async (req, res) => {
    try {
        const comments = await Comment_1.default.find().sort({ createdAt: -1 });
        return res.json(comments);
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.getComments = getComments;
// GET /comment/:id
const getCommentById = async (req, res) => {
    try {
        const comment = await Comment_1.default.findById(req.params.id);
        if (!comment)
            return res.status(404).json({ message: 'Comment not found' });
        return res.json(comment);
    }
    catch {
        return res.status(400).json({ message: 'Invalid comment id' });
    }
};
exports.getCommentById = getCommentById;
// GET /comment/post/:postId
const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment_1.default.find({ postId }).sort({ createdAt: -1 });
        return res.json(comments);
    }
    catch (err) {
        return res.status(400).json({ message: 'Invalid post id' });
    }
};
exports.getCommentsByPost = getCommentsByPost;
// PUT /comment/:id
const updateComment = async (req, res) => {
    try {
        const { authorId, content } = req.body;
        if (!authorId || !content) {
            return res.status(400).json({ message: 'authorId and content are required' });
        }
        const comment = await Comment_1.default.findById(req.params.id);
        if (!comment)
            return res.status(404).json({ message: 'Comment not found' });
        if (comment.authorId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        comment.authorId = authorId;
        comment.content = content;
        const updated = await comment.save();
        return res.json(updated);
    }
    catch {
        return res.status(400).json({ message: 'Invalid comment id' });
    }
};
exports.updateComment = updateComment;
// DELETE /comment/:id
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment_1.default.findById(req.params.id);
        if (!comment)
            return res.status(404).json({ message: 'Comment not found' });
        if (comment.authorId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await Comment_1.default.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Comment deleted' });
    }
    catch {
        return res.status(400).json({ message: 'Invalid comment id' });
    }
};
exports.deleteComment = deleteComment;
