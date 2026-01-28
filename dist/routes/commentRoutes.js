"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentController_1 = require("../controllers/commentController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post('/', auth_1.default, commentController_1.createComment);
router.get('/', commentController_1.getComments);
router.get('/post/:postId', commentController_1.getCommentsByPost);
router.get('/:id', commentController_1.getCommentById);
router.put('/:id', auth_1.default, commentController_1.updateComment);
router.delete('/:id', auth_1.default, commentController_1.deleteComment);
exports.default = router;
