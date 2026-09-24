import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

/**
 * Renders the checkout page.
 * Handles order total calculation, promotional code application, 
 * and secure payment processing via Stripe.
 * 
 * @returns {JSX.Element} The Checkout component
 */
const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, refreshCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.items?.reduce((sum, i) => sum + (i.productId?.price || 0) * i.quantity, 0) || 0;
  const total = subtotal - subtotal * discount;

  /**
   * Validates the entered promotional code against the backend API.
   * Updates the discount state if valid, or sets an error message if invalid.
   */
  const applyPromo = async () => {
    setError('');
    try {
      const res = await api.post('/promo/validate', { code: promoCode });
      setDiscount(res.data.discountValue);
    } catch (err) {
      setDiscount(0);
      setError(err.response?.data?.message || 'Invalid promo code');
    }
  };

  /**
   * Handles the submission of the payment form.
   * Creates a Stripe payment method and sends the checkout payload to the server.
   * Refreshes the global cart state and redirects to the home page upon success.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError('');

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });
      if (stripeError) throw new Error(stripeError.message);

      await api.post('/checkout', {
        paymentMethodId: paymentMethod.id,
        promoCode: promoCode || undefined,
      });

      await refreshCart();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 text-[22px] font-semibold tracking-heading text-ink">Checkout</h1>

      <div className="mb-6 flex gap-2">
        <input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Promo code"
          className="flex-1 rounded-btn border border-border/60 px-4 py-2 text-sm outline-none focus:shadow-hover"
        />
        <button
          type="button"
          onClick={applyPromo}
          className="rounded-btn bg-surface px-4 py-2 text-sm font-medium text-ink hover:shadow-hover"
        >
          Apply
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-card border border-border/30 p-4 shadow-card">
          <CardElement options={{ style: { base: { fontSize: '14px', color: '#222222' } } }} />
        </div>

        <div className="space-y-1 text-sm text-ink-secondary">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          {discount > 0 && <p>Discount: -{(discount * 100).toFixed(0)}%</p>}
          <p className="text-base font-semibold text-ink">Total: ${total.toFixed(2)}</p>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}

        <button
          type="submit"
          disabled={!stripe || submitting}
          className="w-full rounded-btn bg-primary py-3 text-sm font-medium text-white hover:shadow-hover disabled:opacity-50"
        >
          {submitting ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
      </form>
    </main>
  );
};

export default Checkout;