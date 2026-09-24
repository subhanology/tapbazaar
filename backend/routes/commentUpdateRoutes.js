const express = require('express');
const { updateComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
