const express = require('express');
const { checkout, getMyOrders } = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, checkout);
router.get('/orders', protect, getMyOrders);

module.exports = router;
