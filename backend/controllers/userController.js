const cloudinary = require('../config/cloudinary');
const User = require('../models/User');

// Streams a memory buffer (from multer) up to Cloudinary and resolves with the result.
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

// GET /api/users/me
const getProfile = async (req, res) => {
  res.status(200).json({ user: req.user });
};

// PUT /api/users/me/picture — multipart/form-data, field name "displayPicture"
// PUT /api/users/me/picture — multipart/form-data, field name "displayPicture"
const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file was provided' });
    }

    // Captured BEFORE we overwrite it — this is the piece that was missing.
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

    // Only delete the old photo AFTER the new one is safely saved — if the
    // new upload had failed above, we'd never reach here and the old photo
    // (still the active one) stays untouched.
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