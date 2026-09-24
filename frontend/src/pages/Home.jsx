import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";

const Arrow = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = user ? `/products?excludeUserId=${user._id}` : "/products";
    api
      .get(url)
      .then((res) => setProducts(res.data.products || []))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <main>
      <section className="border-b border-border bg-[#faf9f7]">
        <div className="page-shell grid items-center gap-10 py-14 md:grid-cols-[1.05fr_.95fr] md:py-20">
          <div>
            <p className="section-kicker">Buy. Sell. Discover.</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl md:text-[58px]">
              Find things worth <span className="text-primary">keeping.</span>
            </h1>
            <p className="section-copy mt-5 max-w-xl text-base md:text-[17px]">
              A simpler marketplace for finding great products and giving the
              things you own a second life.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#listings" className="btn-primary">
                Explore listings <Arrow />
              </a>
              <Link to="/products/new" className="btn-secondary">
                Sell something
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-secondary">
                Easy discovery
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-secondary">
                Simple checkout
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-secondary">
                Seller listings
              </span>
            </div>
          </div>
          <div className="relative hidden min-h-[340px] overflow-hidden rounded-[28px] bg-ink p-8 shadow-float md:block">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/25 blur-2xl" />
            <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between text-white/60">
                <span className="text-xs font-bold uppercase tracking-[.18em]">
                  TapBazaar
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px]">
                  Marketplace
                </span>
              </div>
              <div>
                <p className="max-w-sm text-3xl font-bold leading-tight text-white">
                  Good products deserve a better place to be found.
                </p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">
                  Browse the latest listings from your marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="listings" className="page-shell py-12 md:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker">Fresh finds</p>
            <h2 className="section-title mt-1">Latest listings</h2>
          </div>
          <span className="text-sm font-semibold text-ink-secondary">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-card border border-border"
              >
                <div className="aspect-[4/3] bg-surface-strong" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-surface-strong" />
                  <div className="h-5 w-1/3 rounded bg-surface-strong" />
                  <div className="h-9 rounded bg-surface-strong" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="muted-panel px-6 py-16 text-center">
            <p className="text-lg font-bold text-ink">No listings yet</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Be the first to put something great up for sale.
            </p>
            <Link to="/products/new" className="btn-primary mt-5">
              Create a listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
export default Home;
