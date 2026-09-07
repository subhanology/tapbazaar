import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateItemQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = cart.items?.reduce((sum, i) => sum + (i.productId?.price || 0) * i.quantity, 0) || 0;

  const handleCheckoutClick = () => {
    // Guest checkout prompt: unauth users are redirected to sign in first
    if (!user) return navigate('/signin');
    navigate('/checkout');
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-ink-secondary">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block text-legal">
          Browse listings
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-[22px] font-semibold tracking-heading text-ink">Your cart</h1>

      <ul className="space-y-4">
        {cart.items.map((item) => (
          <li
            key={item.productId._id}
            className="flex items-center gap-4 rounded-card border border-border/30 p-4 shadow-card"
          >
            {item.productId.images?.[0] && (
              <img src={item.productId.images[0]} alt="" className="h-16 w-16 rounded-btn object-cover" />
            )}
            <div className="flex-1">
              <p className="font-medium text-ink">{item.productId.title}</p>
              <p className="text-sm text-ink-secondary">${item.productId.price?.toFixed(2)}</p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItemQuantity(item.productId._id, Number(e.target.value))}
              className="w-16 rounded-btn border border-border/60 px-2 py-1 text-center text-sm"
            />
            <button
              onClick={() => removeItem(item.productId._id)}
              className="text-xs text-error hover:underline"
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
          className="rounded-btn bg-rausch px-6 py-3 text-sm font-medium text-white hover:shadow-hover"
        >
          Checkout
        </button>
      </div>
    </main>
  );
};

export default Cart;
