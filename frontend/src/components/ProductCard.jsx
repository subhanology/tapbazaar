import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getFriendlyError } from '../utils/errorMessage';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [status, setStatus] = useState('');
  const isOwner = user && (product.sellerId === user._id || product.sellerId?._id === user._id);

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation(); setStatus('adding');
    try { await addItem(product._id); setStatus('added'); setTimeout(() => setStatus(''), 1500); }
    catch (err) { setStatus(getFriendlyError(err, "Couldn't add this to your cart.")); }
  };

  return (
    <Link to={`/products/${product._id}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-hover">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        {product.images?.[0] ? <img src={product.images[0].url} alt={product.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]" /> : <div className="flex h-full items-center justify-center text-sm text-ink-secondary">No image</div>}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-sm backdrop-blur">For sale</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-ink">{product.title}</h3>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <p className="text-[17px] font-extrabold text-ink">${product.price?.toFixed(2)}</p>
            <p className="truncate text-[11px] text-ink-disabled">#{product.serialNumber}</p>
          </div>
        </div>
        {!isOwner && <div className="mt-4"><button onClick={handleAddToCart} disabled={status === 'adding'} className="btn-primary w-full py-2.5 text-xs disabled:opacity-60">{status === 'adding' ? 'Adding…' : status === 'added' ? '✓ Added to cart' : 'Add to cart'}</button>{status && status !== 'adding' && status !== 'added' && <p className="mt-1.5 text-[11px] text-error">{status}</p>}</div>}
      </div>
    </Link>
  );
};
export default ProductCard;
