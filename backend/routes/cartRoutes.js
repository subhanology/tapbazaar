const express = require('express');
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  mergeCart,
} = require('../controllers/cartController');
const { protect, attachUserIfPresent } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', attachUserIfPresent, getCart);
router.post('/items', attachUserIfPresent, addItem);
router.put('/items/:productId', attachUserIfPresent, updateItemQuantity);
router.delete('/items/:productId', attachUserIfPresent, removeItem);
router.post('/merge', protect, mergeCart);

module.exports = router;
