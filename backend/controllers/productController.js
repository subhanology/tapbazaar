const { z } = require('zod');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');

const productSchema = z.object({
  title: z.string().min(1),
  price: z.coerce.number().nonnegative(), // multipart fields arrive as strings
});

// Streams one memory buffer (from multer) up to Cloudinary.
const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'tapbazaar/products', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// Uploads every file in parallel and returns [{ url, publicId }, ...]
const uploadAllImages = async (files = []) => {
  const results = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));
  return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
};

// Best-effort delete of a set of Cloudinary assets. Logs failures instead of
// throwing, so one bad/already-gone asset can't block the whole operation.
const deleteImagesFromCloudinary = async (images = []) => {
  const results = await Promise.allSettled(
    images.map((img) => cloudinary.uploader.destroy(img.publicId))
  );
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Failed to delete Cloudinary image ${images[i].publicId}:`, r.reason);
    }
  });
};

// GET /api/products
// GET /api/products — Now with Pagination & Exclusion filtering!
const getProducts = async (req, res, next) => {
  try {
    // Grab query params from the frontend URL (e.g., ?page=1&limit=10&excludeUserId=123)
    const { page = 1, limit = 10, excludeUserId } = req.query;
    
    // Build our search filter
    const query = {};
    if (excludeUserId) {
      query.sellerId = { $ne: excludeUserId }; // $ne means "Not Equal to"
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1) // The size of the "pizza slice"
      .skip((page - 1) * limit) // Skip the slices we already ate
      .populate('sellerId', 'email displayPicture');

    // Count total items so the frontend knows when to stop asking for more
    const total = await Product.countDocuments(query);

    res.status(200).json({ 
      products, 
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/my-listings — Dedicated route for the user's own items
const getMyListings = async (req, res, next) => {
  try {
    // Because this will be a protected route, req.user._id is automatically available!
    const products = await Product.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'email displayPicture');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
};

// POST /api/products — multipart/form-data, field name "images" (multiple)
const createProduct = async (req, res, next) => {
  let uploadedImages = [];
  try {
    const data = productSchema.parse(req.body);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    uploadedImages = await uploadAllImages(req.files);

    // serialNumber auto-generated via pre-save hook (BR-04)
    const product = await Product.create({
      ...data,
      sellerId: req.user._id,
      images: uploadedImages,
    });

    res.status(201).json({ product });
  } catch (err) {
    // If the DB write failed after images were already uploaded, don't leave
    // orphaned files sitting in Cloudinary — clean them back up.
    if (uploadedImages.length) await deleteImagesFromCloudinary(uploadedImages);

    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

// PUT /api/products/:id — owner only. Optional new images REPLACE the old set
// (old Cloudinary images are deleted so nothing gets orphaned).
const updateProduct = async (req, res, next) => {
  let newImages = [];
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own products.' });
    }

    const data = productSchema.partial().parse(req.body);
    Object.assign(product, data);

    if (req.files && req.files.length > 0) {
      newImages = await uploadAllImages(req.files);
      const oldImages = product.images;
      product.images = newImages;
      await product.save();
      await deleteImagesFromCloudinary(oldImages); // clean up only after the swap succeeds
    } else {
      await product.save();
    }

    res.status(200).json({ product });
  } catch (err) {
    if (newImages.length) await deleteImagesFromCloudinary(newImages);
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

// DELETE /api/products/:id — owner only. Deletes the DB record AND every
// associated Cloudinary image, so storage never fills up with orphans.
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own products.' });
    }

    await deleteImagesFromCloudinary(product.images);
    await product.deleteOne();

    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getMyListings };