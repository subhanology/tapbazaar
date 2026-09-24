const multer = require('multer');

const storage = multer.memoryStorage();

/**
 * Validates the MIME type of incoming file uploads.
 * Restricts uploads to JPEG, PNG, WEBP, and GIF formats.
 * * @param {Object} _req - Express request object (unused)
 * @param {Object} file - The file object provided by multer
 * @param {Function} cb - Callback function to accept or reject the file
 */
const imageFileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
  }
  cb(null, true);
};

/**
 * Multer middleware instance configured for memory storage.
 * Limits file size to 5MB and enforces image-only file types.
 * Memory storage allows files to be streamed directly to external storage (e.g., Cloudinary)
 * without being written to the local disk.
 */
const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;