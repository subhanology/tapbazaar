import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
const Checkout = () => {
  const stripe = useStripe(),
    elements = useElements();
  const { cart, refreshCart } = useCart();
  const [promoCode, setPromoCode] = useState(""),
    [discount, setDiscount] = useState(0),
    [error, setError] = useState(""),
    [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const subtotal =
    cart.items?.reduce(
      (sum, i) => sum + (i.productId?.price || 0) * i.quantity,
      0,
    ) || 0;
  const total = subtotal - subtotal * discount;
  const applyPromo = async () => {
    setError("");
    if (!promoCode.trim()) return setError("Enter a promo code first.");
    try {
      const res = await api.post("/promo/validate", { code: promoCode });
      setDiscount(res.data.discountValue);
    } catch (err) {
      setDiscount(0);
      setError(err.response?.data?.message || "Invalid promo code");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");
    try {
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });
      if (stripeError) throw new Error(stripeError.message);
      await api.post("/checkout", {
        paymentMethodId: paymentMethod.id,
        promoCode: promoCode || undefined,
      });
      await refreshCart();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <main className="page-shell py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/cart"
          className="text-sm font-semibold text-ink-secondary hover:text-ink"
        >
          ← Back to cart
        </Link>
        <div className="mb-8 mt-5">
          <p className="section-kicker">Secure checkout</p>
          <h1 className="section-title mt-1">Complete your order</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Review your total and enter your payment details.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="surface-card p-5 sm:p-7">
            <h2 className="text-lg font-extrabold">Payment details</h2>
            <p className="mt-1 text-xs text-ink-secondary">
              Your card details are securely handled by Stripe.
            </p>
            <div className="mt-5 rounded-xl border border-border bg-surface p-4">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "15px",
                      color: "#171717",
                      fontFamily: "Inter, sans-serif",
                      "::placeholder": { color: "#a1a1aa" },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold text-ink">Promo code</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Optional code"
                  className="input-modern"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  className="btn-secondary shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-error">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={!stripe || submitting}
              className="btn-primary mt-6 w-full py-3.5 disabled:opacity-50"
            >
              {submitting ? "Processing payment…" : `Pay $${total.toFixed(2)}`}
            </button>
          </form>
          <aside className="surface-card h-fit p-5 lg:sticky lg:top-28">
            <h2 className="text-lg font-extrabold">Order summary</h2>
            <div className="mt-5 space-y-3 border-b border-border pb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-secondary">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{(discount * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="font-bold">Total</span>
              <span className="text-xl font-extrabold">
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="mt-4 rounded-xl bg-surface p-3 text-[11px] leading-5 text-ink-secondary">
              Payments are processed securely. TapBazaar never stores your full
              card details.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
};
export default Checkout;
