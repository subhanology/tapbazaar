const { z } = require('zod');
const Comment = require('../models/Comment');
const Product = require('../models/Product');

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

const COMMENTS_PAGE_SIZE = 10;

/**
 * Retrieves a paginated list of comments for a specific product, ordered by newest first.
 * Route: GET /api/products/:id/comments
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getComments = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || COMMENTS_PAGE_SIZE);

    const [comments, total] = await Promise.all([
      Comment.find({ productId: req.params.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'email displayPicture'),
      Comment.countDocuments({ productId: req.params.id }),
    ]);

    res.status(200).json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Creates a new comment on a specific product.
 * Sellers are restricted from commenting on their own products.
 * Route: POST /api/products/:id/comments
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createComment = async (req, res, next) => {
  try {
    const { content } = commentSchema.parse(req.body);

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot comment on your own product.' });
    }

    const comment = await Comment.create({
      productId: product._id,
      userId: req.user._id,
      content,
    });
    await comment.populate('userId', 'email displayPicture');

    res.status(201).json({ comment });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

/**
 * Updates the content of an existing comment.
 * Authorization: Only the author of the comment can perform this action.
 * Route: PUT /api/comments/:id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own comments.' });
    }

    const { content } = commentSchema.parse(req.body);
    comment.content = content;
    await comment.save();

    res.status(200).json({ comment });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

/**
 * Deletes a specific comment.
 * Authorization: Only the author of the comment can perform this action.
 * Route: DELETE /api/comments/:id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own comments.' });
    }

    await comment.deleteOne();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };