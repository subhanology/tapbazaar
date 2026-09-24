import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

/**
 * Renders the home page view.
 * Displays a promotional hero section and a grid of available product listings,
 * automatically excluding the currently logged-in user's items if authenticated.
 * 
 * @returns {JSX.Element} The Home component
 */
const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = user ? `/products?excludeUserId=${user._id}` : '/products';

    api
      .get(url)
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-14 sm:py-16">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-badge border border-verified/25 bg-verified-soft px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-verified">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Every listing ships with a verified serial number
          </span>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-heading text-link sm:text-5xl">
            Buy and sell things worth trusting.
          </h1>
          <p className="max-w-md text-base text-ink-secondary">
            No guessing games — every item on tapbazaar is tagged, traceable, and yours to check before you buy.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-card border border-border">
                <div className="aspect-[4/3] bg-surface" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded bg-surface" />
                  <div className="h-3 w-1/3 rounded bg-surface" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-20 text-center">
            <p className="font-display text-lg text-link">Nothing listed yet</p>
            <p className="max-w-xs text-sm text-ink-secondary">Be the first to list an item and give it its own serial number.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;