const { z } = require('zod');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');

const productSchema = z.object({
  title: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  category: z.string().min(1, 'Please choose a category'),
  description: z.string().max(2000).optional().default(''),
});

/**
 * Uploads a single file buffer to Cloudinary via stream.
 * 
 * @param {Buffer} buffer - The file buffer from multer
 * @returns {Promise<Object>} The Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'tapbazaar/products', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

/**
 * Uploads an array of files to Cloudinary in parallel.
 * 
 * @param {Array} files - Array of file objects containing buffers
 * @returns {Promise<Array<{url: string, publicId: string}>>} Array of uploaded image data
 */
const uploadAllImages = async (files = []) => {
  const results = await Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer)));
  return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
};

/**
 * Best-effort deletion of multiple Cloudinary assets in parallel.
 * Errors are logged rather than thrown to prevent a single missing asset 
 * from failing the entire batch operation.
 * 
 * @param {Array<{publicId: string}>} images - Array of image objects to delete
 */
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

/**
 * Retrieves a paginated list of products.
 * Supports filtering out a specific user's products.
 * Route: GET /api/products
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, excludeUserId } = req.query;
    
    const query = {};
    if (excludeUserId) {
      query.sellerId = { $ne: excludeUserId };
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sellerId', 'email displayPicture');

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

/**
 * Retrieves all products listed by the authenticated user.
 * Route: GET /api/products/my-listings
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMyListings = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves a single product by its ID.
 * Route: GET /api/products/:id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'email displayPicture');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
};

/**
 * Creates a new product listing and uploads associated images to Cloudinary.
 * Route: POST /api/products
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createProduct = async (req, res, next) => {
  let uploadedImages = [];
  try {
    const data = productSchema.parse(req.body);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    uploadedImages = await uploadAllImages(req.files);

    const product = await Product.create({
      ...data,
      sellerId: req.user._id,
      images: uploadedImages,
    });

    res.status(201).json({ product });
  } catch (err) {
    // Cleanup orphaned Cloudinary assets if database document creation fails
    if (uploadedImages.length) await deleteImagesFromCloudinary(uploadedImages);

    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

/**
 * Updates an existing product listing and manages image additions/deletions.
 * Authorization: Only the product owner can perform this action.
 * Route: PUT /api/products/:id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
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

    const imagesWereTouched = req.body.existingImages !== undefined || (req.files && req.files.length > 0);

    if (imagesWereTouched) {
      let keptImages = [];
      if (req.body.existingImages) {
        try {
          keptImages = JSON.parse(req.body.existingImages);
        } catch {
          keptImages = [];
        }
      }

      const oldImages = product.images;

      if (req.files && req.files.length > 0) {
        newImages = await uploadAllImages(req.files);
      }

      product.images = [...keptImages, ...newImages];
      await product.save();

      // Determine which old images are no longer needed and remove them from Cloudinary
      const keptPublicIds = new Set(keptImages.map((img) => img.publicId));
      const imagesToDelete = oldImages.filter((img) => !keptPublicIds.has(img.publicId));
      if (imagesToDelete.length) await deleteImagesFromCloudinary(imagesToDelete);
    } else {
      await product.save();
    }

    res.status(200).json({ product });
  } catch (err) {
    // Cleanup newly uploaded Cloudinary assets if database update fails
    if (newImages.length) await deleteImagesFromCloudinary(newImages);
    
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

/**
 * Deletes a product listing from the database and removes all associated images from Cloudinary.
 * Authorization: Only the product owner can perform this action.
 * Route: DELETE /api/products/:id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
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