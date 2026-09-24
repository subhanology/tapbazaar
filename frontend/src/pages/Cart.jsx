import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import QuantityStepper from '../components/QuantityStepper';
import { getFriendlyError } from '../utils/errorMessage';

/**
 * Renders the user's shopping cart.
 * Displays selected items, allows quantity adjustments, handles item removals, 
 * and routes to the checkout flow based on authentication status.
 * 
 * @returns {JSX.Element} The Cart component
 */
const Cart = () => {
  const { cart, updateItemQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busyItemId, setBusyItemId] = useState(null);

  const total = cart.items?.reduce((sum, i) => sum + (i.productId?.price || 0) * i.quantity, 0) || 0;

  /**
   * Updates the quantity of a specific item in the cart.
   * Manages local loading state to disable controls during the API request.
   * 
   * @param {string} productId - The ID of the product to update
   * @param {number} quantity - The desired new quantity
   */
  const handleQuantityChange = async (productId, quantity) => {
    setError('');
    setBusyItemId(productId);
    try {
      await updateItemQuantity(productId, quantity);
    } catch (err) {
      setError(getFriendlyError(err, "We couldn't update that quantity. Please try again."));
    } finally {
      setBusyItemId(null);
    }
  };

  /**
   * Removes a specific item from the cart entirely.
   * 
   * @param {string} productId - The ID of the product to remove
   */
  const handleRemove = async (productId) => {
    setError('');
    setBusyItemId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(getFriendlyError(err, "We couldn't remove that item. Please try again."));
      setBusyItemId(null);
    }
  };

  /**
   * Initiates the checkout flow.
   * Forces unauthenticated users to sign in before proceeding.
   */
  const handleCheckoutClick = () => {
    if (!user) return navigate('/signin');
    navigate('/checkout');
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-3 px-6 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-disabled">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <p className="font-display text-lg text-ink-secondary">Your cart is empty</p>
        <Link to="/" className="text-sm text-link hover:underline">
          Browse listings
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-[22px] font-semibold tracking-heading text-ink">Your cart</h1>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <ul className="space-y-4">
        {cart.items.map((item) => (
          <li
            key={item.productId._id}
            className="flex items-center gap-4 rounded-card border border-border/30 p-4 shadow-card"
          >
            {item.productId.images?.[0] && (
              <img src={item.productId.images[0].url} alt="" className="h-16 w-16 rounded-btn object-cover" />
            )}
            <div className="flex-1">
              <p className="font-medium text-ink">{item.productId.title}</p>
              <p className="text-sm text-ink-secondary">${item.productId.price?.toFixed(2)}</p>
            </div>

            <QuantityStepper
              quantity={item.quantity}
              onChange={(qty) => handleQuantityChange(item.productId._id, qty)}
              disabled={busyItemId === item.productId._id}
            />

            <button
              onClick={() => handleRemove(item.productId._id)}
              disabled={busyItemId === item.productId._id}
              className="text-xs text-error hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-lg font-semibold text-ink">Subtotal: ${total.toFixed(2)}</p>
        <button
          onClick={handleCheckoutClick}
          className="rounded-btn bg-primary px-6 py-3 text-sm font-medium text-white hover:shadow-hover"
        >
          Checkout
        </button>
      </div>
    </main>
  );
};

export default Cart;