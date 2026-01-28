import express from 'express';
import {
  createComment,
  getComments,
  getCommentById,
  getCommentsByPost,
  updateComment,
  deleteComment
} from '../controllers/commentController';
import auth from '../middleware/auth';

const router = express.Router();

router.post('/', auth, createComment);
router.get('/', getComments);
router.get('/post/:postId', getCommentsByPost);
router.get('/:id', getCommentById);
router.put('/:id', auth, updateComment);
router.delete('/:id', auth, deleteComment);

export default router;
