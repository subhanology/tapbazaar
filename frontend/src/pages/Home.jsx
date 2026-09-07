import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext'; // Brought this in!

const Home = () => {
  const { user } = useAuth(); // Grab the logged-in user
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a user is logged in, tell the backend to hide their items!
    const url = user ? `/products?excludeUserId=${user._id}` : '/products';

    api
      .get(url)
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [user]); // Add user to dependency array so it updates if they log in/out

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-[28px] font-bold leading-[1.43] text-ink">Discover something new</h1>

      {loading ? (
        <p className="text-ink-secondary">Loading listings...</p>
      ) : products.length === 0 ? (
        <p className="text-ink-secondary">No products yet — be the first to list one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Home;