const express = require('express');
const {
  createComment,
  getComments,
  getCommentById,
  getCommentsByPost,
  updateComment,
  deleteComment
} = require('../controllers/commentController');



const router = express.Router();

router.post('/', createComment);
router.get('/', getComments);
router.get('/post/:postId', getCommentsByPost);
router.get('/:id', getCommentById);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);


module.exports = router;
