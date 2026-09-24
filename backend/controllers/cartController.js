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

/**
 * Resolves and lazily creates a cart for the current request context.
 * Supports both authenticated users and guest sessions.
 * 
 * @param {Object} req - Express request object
 * @returns {Promise<Object|null>} The cart document, or null if no identifier is provided
 */
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

/**
 * Retrieves the current user's or guest's cart, fully populated with product details.
 * Route: GET /api/cart
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
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

/**
 * Adds a new product to the cart or increments the quantity if it already exists.
 * Route: POST /api/cart/items
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = addItemSchema.parse(req.body);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

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

/**
 * Updates the quantity of a specific item currently in the cart.
 * Route: PUT /api/cart/items/:productId
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
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

/**
 * Removes a specific item from the cart entirely.
 * Route: DELETE /api/cart/items/:productId
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
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

/**
 * Merges a guest cart into an authenticated user's cart upon login.
 * Resolves duplicate items by summing their quantities and discards products owned by the user.
 * Route: POST /api/cart/merge
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
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

    const products = await Product.find({
      _id: { $in: guestCart.items.map((i) => i.productId) },
    });
    const productOwnerMap = new Map(products.map((p) => [p._id.toString(), p.sellerId.toString()]));

    guestCart.items.forEach((guestItem) => {
      const pid = guestItem.productId.toString();
      
      if (productOwnerMap.get(pid) === req.user._id.toString()) return;

      const existing = userCart.items.find((i) => i.productId.toString() === pid);
      if (existing) {
        existing.quantity += guestItem.quantity;
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