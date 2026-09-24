import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getFriendlyError } from '../utils/errorMessage';

/**
 * Renders a styled card displaying product information.
 * Includes an "Add to cart" functionality for users who are not the product owner.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.product - The product data to display
 * @returns {JSX.Element} The ProductCard component
 */
const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [status, setStatus] = useState('');

  const isOwner = user && (product.sellerId === user._id || product.sellerId?._id === user._id);

  /**
   * Handles the addition of the product to the user's cart.
   * Manages local UI state to reflect loading, success, or error status.
   * 
   * @param {React.MouseEvent} e - The button click event
   */
  const handleAddToCart = async (e) => {
    e.preventDefault();
    setStatus('adding');
    
    try {
      await addItem(product._id);
      setStatus('added');
      setTimeout(() => setStatus(''), 1500);
    } catch (err) {
      setStatus(getFriendlyError(err, "Couldn't add this to your cart."));
    }
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-white transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-hover"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface">
        {product.images?.[0] ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-secondary">No image</div>
        )}
        {product.serialNumber && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-badge bg-white/90 px-2 py-1 font-mono text-[10px] font-medium tracking-wide text-verified backdrop-blur">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Verified
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-1.5">
          <h3 className="truncate text-base font-semibold tracking-subheading text-ink">{product.title}</h3>
          <p className="text-sm font-medium text-link">${product.price?.toFixed(2)}</p>
          <p className="truncate font-mono text-[11px] text-ink-disabled">#{product.serialNumber}</p>
        </div>

        {!isOwner && (
          <div className="mt-4 space-y-1">
            <button
              onClick={handleAddToCart}
              disabled={status === 'adding'}
              className="w-full rounded-btn bg-primary py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {status === 'adding' ? 'Adding...' : status === 'added' ? 'Added ✓' : 'Add to cart'}
            </button>
            {status && status !== 'adding' && status !== 'added' && (
              <p className="text-xs text-error">{status}</p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;