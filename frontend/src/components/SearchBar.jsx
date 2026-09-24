import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DEBOUNCE_MS = 300;

/**
 * Renders an interactive search bar with live auto-suggestions.
 * Queries the API dynamically with a debounce mechanism to minimize network requests.
 * 
 * @returns {JSX.Element} The SearchBar component
 */
const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  /**
   * Updates the search query state and clears results if the input is emptied.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!query.trim()) return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get('/search', { params: { q: query } });
        setResults(res.data.results);
        setOpen(true);
      } catch (error) {
        console.error("Search fetch error:", error);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  /**
   * Navigates to the selected product's detail page and resets the search state.
   * 
   * @param {string} id - The ID of the selected product
   */
  const goToProduct = (id) => {
    setOpen(false);
    setQuery('');
    navigate(`/products/${id}`);
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      <input
        value={query}
        onChange={handleInputChange}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search for anything..."
        className="w-full rounded-lg2 border border-border/60 px-5 py-3 text-sm text-ink shadow-card outline-none transition focus:shadow-hover"
      />

      {open && results.length > 0 && (
        <ul className="absolute z-40 mt-2 w-full overflow-hidden rounded-card border border-border/40 bg-white shadow-card">
          {results.map((product) => (
            <li key={product._id}>
              <button
                onMouseDown={() => goToProduct(product._id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-surface"
              >
                {product.images?.[0] && (
                  <img src={product.images[0].url} alt="" className="h-10 w-10 rounded-btn object-cover" />
                )}
                <span className="truncate">{product.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;