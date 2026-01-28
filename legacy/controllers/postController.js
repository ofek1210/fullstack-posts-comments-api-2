const Post = require('../models/Post');

// POST /post
const createPost = async (req, res) => {
  try {
    const { sender, content } = req.body;
    if (!sender || !content) {
      return res.status(400).json({ message: 'sender and content are required' });
    }

    const post = await Post.create({ sender, content });
    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /post  (optional query: ?sender=...)
const getPosts = async (req, res) => {
  try {
    const { sender } = req.query;

    const filter = sender ? { sender } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 });

    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /post/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json(post);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid post id' });
  }
};

// PUT /post/:id
const updatePost = async (req, res) => {
  try {
    const { sender, content } = req.body;
    if (!sender || !content) {
      return res.status(400).json({ message: 'sender and content are required' });
    }

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { sender, content },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Post not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: 'Invalid post id' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost
};
