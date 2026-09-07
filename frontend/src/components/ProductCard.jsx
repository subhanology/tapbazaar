import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addItem } = useCart();

  // Check if current user owns this specific product
  const isOwner = user && (product.sellerId === user._id || product.sellerId?._id === user._id);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevents the card's <Link> from redirecting you!
    addItem(product._id);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card transition hover:shadow-hover"
    >
      <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface">
        {product.images?.[0] ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-secondary">No image</div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-1">
          <h3 className="truncate text-base font-semibold tracking-subheading text-ink">{product.title}</h3>
          <p className="text-sm text-ink-secondary">${product.price?.toFixed(2)}</p>
          <p className="text-xs text-ink-disabled">{product.serialNumber}</p>
        </div>

        {/* Add to Cart button at the bottom of the card (Hides if owner) */}
        {!isOwner && (
          <button
            onClick={handleAddToCart}
            className="mt-4 w-full rounded-btn bg-rausch/10 py-2 text-sm font-medium text-rausch transition hover:bg-rausch hover:text-white"
          >
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;