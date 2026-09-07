const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set — checkout routes will fail until it is configured.');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
