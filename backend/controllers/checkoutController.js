const { z } = require('zod');
const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const PromoCode = require('../models/PromoCode');

const checkoutSchema = z.object({
  paymentMethodId: z.string().min(1),
  promoCode: z.string().optional(),
});

/**
 * Processes the user's cart, applies optional promo codes, handles payment via Stripe,
 * and generates an order record. Clears the cart upon successful checkout.
 * Route: POST /api/checkout
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkout = async (req, res, next) => {
  try {
    const { paymentMethodId, promoCode } = checkoutSchema.parse(req.body);

    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const orderRecords = cart.items.map((item) => ({
      productId: item.productId._id,
      title: item.productId.title,
      priceAtPurchase: item.productId.price,
      quantity: item.quantity,
    }));

    const subtotal = orderRecords.reduce((sum, r) => sum + r.priceAtPurchase * r.quantity, 0);

    let discountValue = 0;
    let appliedCode = null;

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
      if (!promo || new Date() > promo.valid_til) {
        return res.status(400).json({ message: 'Invalid or expired promo code' });
      }
      discountValue = promo.discountValue;
      appliedCode = promo.code;
    }

    const discountApplied = Math.round(subtotal * discountValue * 100) / 100;
    const total = Math.round((subtotal - discountApplied) * 100) / 100;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects amounts in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });

    const order = await Order.create({
      userId: req.user._id,
      stripeChargeId: paymentIntent.id,
      orderRecords,
      subtotal,
      discountApplied,
      promoCode: appliedCode,
      total,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ order });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    if (err.type === 'StripeCardError') {
      return res.status(402).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Retrieves the authenticated user's order and payment history, sorted by most recent.
 * Route: GET /api/orders
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkout, getMyOrders };