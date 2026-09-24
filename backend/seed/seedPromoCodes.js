/**
 * Seeds the required promo codes. Promo codes are console/DB-managed only —
 * there is intentionally no admin UI for them (per requirements checklist).
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const PromoCode = require('../models/PromoCode');

const oneYearFromNow = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d;
};

const CODES = [
  { code: 'DEVS1NC', discountValue: 0.3, valid_til: oneYearFromNow() },
  { code: 'PAKARMY', discountValue: 0.5, valid_til: oneYearFromNow() },
  { code: 'AZADI', discountValue: 0.3, valid_til: oneYearFromNow() },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  for (const promo of CODES) {
    // eslint-disable-next-line no-await-in-loop
    await PromoCode.findOneAndUpdate({ code: promo.code }, promo, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
    console.log(`Seeded promo code: ${promo.code}`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
