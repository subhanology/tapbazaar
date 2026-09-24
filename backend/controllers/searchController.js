const Product = require('../models/Product');

/**
 * Executes a product search query based on the provided keyword.
 * Attempts to use MongoDB Atlas Search for fuzzy matching, falling back 
 * to a standard $text query if the Atlas index is unavailable (e.g., local dev).
 * Route: GET /api/search
 * 
 * @param {Object} req - Express request object containing the 'q' query parameter
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(200).json({ results: [] });

    let results;
    try {
      results = await Product.aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: q,
              path: 'title',
              fuzzy: { maxEdits: 1 },
            },
          },
        },
        { $limit: 10 },
      ]);
    } catch (atlasSearchErr) {
      results = await Product.find({ $text: { $search: q } }).limit(10);
    }

    res.status(200).json({ results });
  } catch (err) {
    next(err);
  }
};

module.exports = { search };