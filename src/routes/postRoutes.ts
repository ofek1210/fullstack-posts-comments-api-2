import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost
} from '../controllers/postController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/', auth, createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

export default router;
