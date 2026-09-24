import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEBOUNCE_MS = 300;

const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) { setResults([]); setOpen(false); }
  };

  useEffect(() => {
    if (!query.trim()) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/search', { params: { q: query } });
        setResults(res.data.results || []);
        setOpen(true);
      } catch (error) { console.error('Search fetch error:', error); }
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const goToProduct = (id) => { setOpen(false); setQuery(''); navigate(`/products/${id}`); };

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="flex items-center rounded-full border border-border bg-surface px-4 transition focus-within:border-[#f1a18f] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(227,93,63,.08)]">
        <span className="text-ink-secondary"><SearchIcon /></span>
        <input value={query} onChange={handleInputChange} onFocus={() => results.length && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="Search products, brands and more" className="w-full bg-transparent px-3 py-2.5 text-sm text-ink outline-none" aria-label="Search products" />
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-card border border-border bg-white p-1.5 shadow-float">
          {results.map((product) => (
            <li key={product._id}>
              <button onMouseDown={() => goToProduct(product._id)} className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left text-sm hover:bg-surface">
                {product.images?.[0] ? <img src={product.images[0].url} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <div className="h-11 w-11 rounded-lg bg-surface" />}
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{product.title}</span>
                <span className="text-xs font-bold text-ink-secondary">${product.price?.toFixed(2)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
