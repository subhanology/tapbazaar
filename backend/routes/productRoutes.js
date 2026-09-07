const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyListings
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

const MAX_IMAGES = 6;

router.get('/', getProducts);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', getProductById);
router.post('/', protect, upload.array('images', MAX_IMAGES), createProduct);
router.put('/:id', protect, upload.array('images', MAX_IMAGES), updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;