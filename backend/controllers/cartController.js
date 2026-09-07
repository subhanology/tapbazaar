const { z } = require('zod');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
});

const mergeSchema = z.object({
  guestSessionId: z.string().min(1),
});

/** Resolves (and lazily creates) the cart for the current request — user or guest. */
const findOrCreateCart = async (req) => {
  if (req.user) {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = await Cart.create({ userId: req.user._id, items: [] });
    return cart;
  }

  const guestSessionId = req.headers['x-guest-session-id'] || req.body.guestSessionId;
  if (!guestSessionId) return null;

  let cart = await Cart.findOne({ guestSessionId });
  if (!cart) cart = await Cart.create({ guestSessionId, items: [] });
  return cart;
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req);
    if (!cart) return res.status(200).json({ cart: { items: [] } });

    await cart.populate('items.productId');
    res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/items
const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = addItemSchema.parse(req.body);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // BR-02: cannot add own product to cart
    if (req.user && product.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot add your own product to the cart.' });
    }

    const cart = await findOrCreateCart(req);
    if (!cart) return res.status(400).json({ message: 'No user session or guestSessionId provided' });

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({ cart });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

// PUT /api/cart/items/:productId
const updateItemQuantity = async (req, res, next) => {
  try {
    const { quantity } = updateItemSchema.parse(req.body);
    const cart = await findOrCreateCart(req);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find((i) => i.productId.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({ cart });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

// DELETE /api/cart/items/:productId
const removeItem = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(req);
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({ cart });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/merge — BR-03: guest cart -> authenticated user cart on login
const mergeCart = async (req, res, next) => {
  try {
    const { guestSessionId } = mergeSchema.parse(req.body);

    const guestCart = await Cart.findOne({ guestSessionId });
    if (!guestCart || guestCart.items.length === 0) {
      const userCart = await Cart.findOneAndUpdate(
        { userId: req.user._id },
        {},
        { upsert: true, new: true }
      ).populate('items.productId');
      return res.status(200).json({ cart: userCart });
    }

    let userCart = await Cart.findOne({ userId: req.user._id });
    if (!userCart) userCart = await Cart.create({ userId: req.user._id, items: [] });

    // Filter out guest's own products (defense-in-depth for BR-02 during merge)
    const products = await Product.find({
      _id: { $in: guestCart.items.map((i) => i.productId) },
    });
    const productOwnerMap = new Map(products.map((p) => [p._id.toString(), p.sellerId.toString()]));

    guestCart.items.forEach((guestItem) => {
      const pid = guestItem.productId.toString();
      if (productOwnerMap.get(pid) === req.user._id.toString()) return; // skip own product

      const existing = userCart.items.find((i) => i.productId.toString() === pid);
      if (existing) {
        existing.quantity += guestItem.quantity; // sum duplicate quantities
      } else {
        userCart.items.push({ productId: guestItem.productId, quantity: guestItem.quantity });
      }
    });

    await userCart.save();
    await guestCart.deleteOne();
    await userCart.populate('items.productId');

    res.status(200).json({ cart: userCart });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

module.exports = { getCart, addItem, updateItemQuantity, removeItem, mergeCart };
