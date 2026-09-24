const mongoose = require('mongoose');

const CODE_REGEX = /^(?=.*[A-Z])[A-Z0-9]{4,10}$/;

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: (v) => CODE_REGEX.test(v),
        message: (props) => `${props.value} is not a valid promo code format`,
      },
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    valid_til: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoCode', promoCodeSchema);
