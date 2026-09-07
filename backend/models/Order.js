const mongoose = require('mongoose');

const orderRecordSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    priceAtPurchase: Number,
    quantity: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stripeChargeId: {
      type: String,
      required: true,
    },
    orderRecords: {
      type: [orderRecordSchema],
      required: true,
    },
    subtotal: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    promoCode: { type: String, default: null },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
