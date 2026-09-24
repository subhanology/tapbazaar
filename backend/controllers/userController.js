const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

/**
 * Uploads a file buffer to Cloudinary via stream.
 * Applies default transformations for profile pictures (cropping to 400x400 and centering on face).
 * 
 * @param {Buffer} buffer - The file buffer from multer
 * @returns {Promise<Object>} The Cloudinary upload result
 */
const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'tapbazaar/profile-pictures',
        resource_type: 'image',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

/**
 * Retrieves the currently authenticated user's profile data.
 * Route: GET /api/users/me
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  res.status(200).json({ user: req.user });
};

/**
 * Updates the user's profile picture.
 * Uploads the new image to Cloudinary and cleans up the previous image if one existed.
 * Route: PUT /api/users/me/picture (multipart/form-data, field: "displayPicture")
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file was provided' });
    }

    const oldPublicId = req.user.displayPicturePublicId;

    const result = await uploadBufferToCloudinary(req.file.buffer);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        displayPicture: result.secure_url,
        displayPicturePublicId: result.public_id,
      },
      { new: true }
    );

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (cleanupErr) {
        console.error(`Failed to delete old profile picture ${oldPublicId}:`, cleanupErr);
      }
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfilePicture };