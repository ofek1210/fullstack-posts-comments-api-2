const Comment = require('../models/Comment');

// POST /comment
const createComment = async (req, res) => {
  try {
    const { postId, sender, content } = req.body;
    if (!postId || !sender || !content) {
      return res.status(400).json({ message: 'postId, sender and content are required' });
    }

    const comment = await Comment.create({ postId, sender, content });
    return res.status(201).json(comment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /comment
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /comment/:id
const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    return res.json(comment);
  } catch {
    return res.status(400).json({ message: 'Invalid comment id' });
  }
};

// GET /comment/post/:postId
const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
    return res.json(comments);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid post id' });
  }
};

// PUT /comment/:id
const updateComment = async (req, res) => {
  try {
    const { sender, content } = req.body;
    if (!sender || !content) {
      return res.status(400).json({ message: 'sender and content are required' });
    }

    const updated = await Comment.findByIdAndUpdate(
      req.params.id,
      { sender, content },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Comment not found' });
    return res.json(updated);
  } catch {
    return res.status(400).json({ message: 'Invalid comment id' });
  }
};

// DELETE /comment/:id
const deleteComment = async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Comment not found' });
    return res.json({ message: 'Comment deleted' });
  } catch {
    return res.status(400).json({ message: 'Invalid comment id' });
  }
};

module.exports = {
  createComment,
  getComments,
  getCommentById,
  getCommentsByPost,
  updateComment,
  deleteComment
};
