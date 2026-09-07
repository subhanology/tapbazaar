const { z } = require('zod');
const stripe = require('../config/stripe');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
// const PromoCode = require('../models/PromoCode'); // <-- Commented out

const checkoutSchema = z.object({
  paymentMethodId: z.string().min(1),
  // promoCode: z.string().optional(), // <-- Commented out
});

// POST /api/checkout
const checkout = async (req, res, next) => {
  try {
    // Removed promoCode from the destructured parsed body
    const { paymentMethodId } = checkoutSchema.parse(req.body);

    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Historical snapshot fields 
    const orderRecords = cart.items.map((item) => ({
      productId: item.productId._id,
      title: item.productId.title,
      priceAtPurchase: item.productId.price,
      quantity: item.quantity,
    }));

    const subtotal = orderRecords.reduce((sum, r) => sum + r.priceAtPurchase * r.quantity, 0);

    /* --- PROMO LOGIC COMMENTED OUT ---
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
    */ 
    
    // Total is now just the subtotal!
    const total = Math.round(subtotal * 100) / 100;

    // Stripe amounts are in the smallest currency unit (cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
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
      // discountApplied, // <-- Commented out
      // promoCode: appliedCode, // <-- Commented out
      total,
    });

    // Cart clearance after successful checkout
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

// GET /api/orders — BONUS: order/payment history view
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkout, getMyOrders };