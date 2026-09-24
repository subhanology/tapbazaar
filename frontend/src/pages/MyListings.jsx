import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/products")
      .then((res) =>
        setListings(
          (res.data.products || []).filter((p) => p.sellerId?._id === user._id),
        ),
      )
      .finally(() => setLoading(false));
  }, [user._id]);
  return (
    <main className="page-shell py-10 md:py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Seller dashboard</p>
          <h1 className="section-title mt-1">My listings</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Manage the products you’ve put on TapBazaar.
          </p>
        </div>
        <Link to="/products/new" className="btn-primary shrink-0">
          + New listing
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-card border border-border"
            >
              <div className="aspect-[4/3] bg-surface-strong" />
              <div className="p-4">
                <div className="h-4 w-2/3 rounded bg-surface-strong" />
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="muted-panel px-6 py-16 text-center">
          <p className="text-lg font-bold">Nothing listed yet</p>
          <p className="mt-1 text-sm text-ink-secondary">
            Create your first listing and start selling.
          </p>
          <Link to="/products/new" className="btn-primary mt-5">
            Create listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {listings.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
};
export default MyListings;
