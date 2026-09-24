import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import QuantityStepper from "../components/QuantityStepper";
import { getFriendlyError } from "../utils/errorMessage";

const Cart = () => {
  const { cart, updateItemQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busyItemId, setBusyItemId] = useState(null);
  const total =
    cart.items?.reduce(
      (sum, i) => sum + (i.productId?.price || 0) * i.quantity,
      0,
    ) || 0;
  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const handleQuantityChange = async (productId, quantity) => {
    setError("");
    setBusyItemId(productId);
    try {
      await updateItemQuantity(productId, quantity);
    } catch (err) {
      setError(getFriendlyError(err, "We couldn't update that quantity."));
    } finally {
      setBusyItemId(null);
    }
  };
  const handleRemove = async (productId) => {
    setError("");
    setBusyItemId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(getFriendlyError(err, "We couldn't remove that item."));
      setBusyItemId(null);
    }
  };
  if (!cart.items || cart.items.length === 0)
    return (
      <main className="page-shell py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-2xl">
            🛒
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-ink">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Looks like you haven't added anything yet.
          </p>
          <Link to="/" className="btn-primary mt-6">
            Browse listings
          </Link>
        </div>
      </main>
    );
  return (
    <main className="page-shell py-10 md:py-14">
      <div className="mb-8">
        <p className="section-kicker">Ready when you are</p>
        <h1 className="section-title mt-1">
          Your cart{" "}
          <span className="text-base font-semibold text-ink-secondary">
            ({itemCount})
          </span>
        </h1>
      </div>
      {error && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <ul className="space-y-3">
          {cart.items.map((item) => (
            <li
              key={item.productId._id}
              className="surface-card flex gap-4 p-3 sm:p-4"
            >
              {item.productId.images?.[0] ? (
                <img
                  src={item.productId.images[0].url}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
                />
              ) : (
                <div className="h-24 w-24 shrink-0 rounded-xl bg-surface" />
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="truncate font-bold text-ink">
                    {item.productId.title}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-secondary">
                    ${item.productId.price?.toFixed(2)}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <QuantityStepper
                    quantity={item.quantity}
                    onChange={(qty) =>
                      handleQuantityChange(item.productId._id, qty)
                    }
                    disabled={busyItemId === item.productId._id}
                  />
                  <button
                    onClick={() => handleRemove(item.productId._id)}
                    disabled={busyItemId === item.productId._id}
                    className="text-xs font-bold text-ink-secondary hover:text-error"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <aside className="surface-card p-5 lg:sticky lg:top-28">
          <h2 className="text-lg font-extrabold text-ink">Order summary</h2>
          <div className="mt-5 space-y-3 border-b border-border pb-5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Subtotal</span>
              <span className="font-semibold text-ink">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Shipping</span>
              <span className="font-semibold text-success">
                Calculated at checkout
              </span>
            </div>
          </div>
          <div className="mt-5 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="text-xl font-extrabold">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={() => (user ? navigate("/checkout") : navigate("/signin"))}
            className="btn-primary mt-5 w-full py-3.5"
          >
            Continue to checkout
          </button>
          <p className="mt-3 text-center text-[11px] text-ink-disabled">
            Secure payment powered by Stripe
          </p>
        </aside>
      </div>
    </main>
  );
};
export default Cart;
