const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    displayPicture: {
      type: String,
      default: '',
    },
    displayPicturePublicId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Never leak the hash in API responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.displayPicturePublicId;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
