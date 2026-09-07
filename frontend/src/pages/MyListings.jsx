import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

// Note: this filters client-side against the full product list. Fine for now —
// if the catalog grows large, add a `?sellerId=` filter on GET /api/products
// on the backend and switch this to pass that param instead.
const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products').then((res) => {
      const mine = res.data.products.filter((p) => p.sellerId?._id === user._id);
      setListings(mine);
      setLoading(false);
    });
  }, [user._id]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-heading text-ink">My Listings</h1>
        <Link to="/products/new" className="rounded-btn bg-rausch px-4 py-2 text-sm font-medium text-white hover:shadow-hover">
          + New listing
        </Link>
      </div>

      {loading ? (
        <p className="text-ink-secondary">Loading...</p>
      ) : listings.length === 0 ? (
        <p className="text-ink-secondary">You haven't listed anything yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
};

export default MyListings;