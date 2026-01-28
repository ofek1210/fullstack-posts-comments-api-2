const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost
} = require('../controllers/postController');

const router = express.Router();

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id', updatePost);

module.exports = router;
