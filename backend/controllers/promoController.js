const { z } = require('zod');
const PromoCode = require('../models/PromoCode');

const CODE_REGEX = /^(?=.*[A-Z])[A-Z0-9]{4,10}$/;

const validateSchema = z.object({
  code: z.string().regex(CODE_REGEX, 'Promo code must be 4-10 uppercase alphanumeric characters'),
});

/**
 * Validates a promotional code, checking for existence and ensuring it hasn't expired.
 * Route: POST /api/promo/validate
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validatePromo = async (req, res, next) => {
  try {
    const { code } = validateSchema.parse(req.body);

    const promo = await PromoCode.findOne({ code: code.toUpperCase() });
    if (!promo) {
      return res.status(400).json({ message: 'Invalid promo code' });
    }

    if (new Date() > promo.valid_til) {
      return res.status(400).json({ message: 'This promo code has expired' });
    }

    res.status(200).json({ code: promo.code, discountValue: promo.discountValue });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: err.errors[0].message });
    }
    next(err);
  }
};

module.exports = { validatePromo };