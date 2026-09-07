const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    // Needed to delete the exact asset from Cloudinary later — without this,
    // there's no reliable way to remove an image once it's uploaded.
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// BR-04: auto-generate a unique serial number before first save
productSchema.pre('validate', async function (next) {
  if (this.serialNumber) return;
  const { generateSerialNumber } = require('../utils/generateSerialNumber');
  this.serialNumber = await generateSerialNumber(this.constructor);
});

// Fallback text index for local/dev search (Atlas Search index configured separately)
productSchema.index({ title: 'text' });

module.exports = mongoose.model('Product', productSchema);