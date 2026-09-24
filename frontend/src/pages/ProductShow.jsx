import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CommentList from '../components/CommentList';

const ProductShow = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product)).catch((err) => setError(err.response?.data?.message || 'Could not load this listing.'));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true); setError('');
    try { await api.delete(`/products/${id}`); navigate('/my-listings'); } catch (err) { setError(err.response?.data?.message || 'Could not delete listing'); setDeleting(false); }
  };

  if (!product) return <main className="page-shell py-16"><div className="animate-pulse space-y-4"><div className="h-8 w-48 rounded bg-surface-strong" /><div className="h-64 rounded-card bg-surface-strong" /></div></main>;
  const isOwner = user && product.sellerId?._id === user._id;
  const images = product.images || [];
  const currentImage = images[activeImg] || images[0];

  const handleAdd = async () => { setError(''); try { await addItem(product._id); setAdded(true); setTimeout(() => setAdded(false), 1800); } catch (err) { setError(err.response?.data?.message || 'Could not add this item to your cart.'); } };

  return (
    <main className="page-shell py-8 md:py-12">
      <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink">← Back to listings</Link>
      <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
        <div>
          <div className="overflow-hidden rounded-[24px] border border-border bg-surface shadow-card">{currentImage ? <img src={currentImage.url} alt={product.title} className="aspect-[4/3] w-full object-cover" /> : <div className="flex aspect-[4/3] items-center justify-center text-sm text-ink-secondary">No image</div>}</div>
          {images.length > 1 && <div className="mt-3 grid grid-cols-6 gap-2">{images.map((img, i) => <button key={img.publicId || i} onClick={() => setActiveImg(i)} className={`aspect-square overflow-hidden rounded-xl border-2 ${i === activeImg ? 'border-primary' : 'border-transparent'}`}><img src={img.url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-ink-disabled">#{product.serialNumber}</span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink md:text-4xl">{product.title}</h1>
          {product.category && <p className="mt-1 text-sm font-semibold text-ink-secondary">{product.category}</p>}
          <p className="mt-4 text-3xl font-extrabold text-ink">${product.price?.toFixed(2)}</p>
          <div className="my-7 border-y border-border py-5"><p className="text-xs font-bold uppercase tracking-wider text-ink-secondary">Seller</p><p className="mt-1 text-sm font-semibold text-ink">{product.sellerId?.email}</p></div>
          {!isOwner ? <button onClick={handleAdd} className="btn-primary w-full py-3.5 text-sm">{added ? '✓ Added to cart' : 'Add to cart'}</button> : <div className="flex gap-3"><Link to={`/products/${id}/edit`} className="btn-primary flex-1">Edit listing</Link><button onClick={handleDelete} disabled={deleting} className="btn-secondary flex-1 text-error">{deleting ? 'Deleting…' : 'Delete'}</button></div>}
          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-error">{error}</p>}
          <div className="mt-7 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-surface p-3"><p className="text-xs font-bold text-ink">Secure</p><p className="mt-1 text-[10px] text-ink-secondary">Stripe checkout</p></div><div className="rounded-xl bg-surface p-3"><p className="text-xs font-bold text-ink">Simple</p><p className="mt-1 text-[10px] text-ink-secondary">Easy cart flow</p></div><div className="rounded-xl bg-surface p-3"><p className="text-xs font-bold text-ink">Direct</p><p className="mt-1 text-[10px] text-ink-secondary">Seller listing</p></div></div>
        </div>
      </div>

      {product.description && (
        <section className="mt-12 border-t border-border pt-10">
          <p className="section-kicker">About this item</p>
          <h2 className="section-title mt-1">Description</h2>
          <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-ink-secondary">{product.description}</p>
        </section>
      )}

      <section className="mt-14 border-t border-border pt-10"><div className="mb-5"><p className="section-kicker">Community</p><h2 className="section-title mt-1">Questions & comments</h2></div><CommentList productId={id} sellerId={product.sellerId?._id} /></section>
    </main>
  );
};
export default ProductShow;
