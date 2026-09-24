import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CommentList from '../components/CommentList';

/**
 * Renders the product detail view.
 * Displays interactive product images, detailed pricing, serial numbers, 
 * seller information, cart management actions, and an integrated comment section.
 * Also provides management controls (edit/delete) if the current user owns the listing.
 * 
 * @returns {JSX.Element} The ProductShow component
 */
const ProductShow = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
    api.get(`/products/${id}/comments`).then((res) => setComments(res.data.comments));
  }, [id]);

  /**
   * Handles the deletion of the product listing after user confirmation.
   * Redirects to the user's listings page upon success.
   */
  const handleDelete = async () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/products/${id}`);
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete listing');
      setDeleting(false);
    }
  };

  if (!product) return <main className="mx-auto max-w-5xl px-6 py-10 text-ink-secondary">Loading...</main>;

  const isOwner = user && product.sellerId?._id === user._id;
  const images = product.images || [];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-card shadow-card">
            {images.length > 0 ? (
              <img src={images[activeImg].url} alt={product.title} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-surface text-ink-secondary">
                No image
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.publicId}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-btn border-2 ${
                    i === activeImg ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-[22px] font-semibold tracking-heading text-ink">{product.title}</h1>
          <p className="text-xl text-ink">${product.price?.toFixed(2)}</p>
          <p className="text-xs text-ink-disabled">Serial: {product.serialNumber}</p>
          <p className="text-sm text-ink-secondary">Sold by {product.sellerId?.email}</p>

          {!isOwner && (
            <div className="pt-2">
              <button
                onClick={() => addItem(product._id)}
                className="rounded-btn bg-primary px-8 py-3 text-sm font-medium text-white transition hover:shadow-hover"
              >
                Add to Cart
              </button>
            </div>
          )}

          {isOwner && (
            <div className="flex gap-3 pt-2">
              <Link
                to={`/products/${id}/edit`}
                className="rounded-btn bg-ink px-5 py-3 text-sm font-medium text-white transition hover:shadow-hover"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-btn border border-error px-5 py-3 text-sm font-medium text-error transition hover:bg-error/5 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
          {error && <p className="text-xs text-error">{error}</p>}
        </div>

        <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold text-ink">Comments</h2>
        <CommentList
          productId={id}
          sellerId={product.sellerId?._id}
          comments={comments}
          setComments={setComments}
        />
      </section>
      </div>
    </main>
  );
};

export default ProductShow;