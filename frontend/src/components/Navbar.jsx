import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';
import AccountMenu from './AccountMenu';

const Navbar = () => {
  const { user } = useAuth();

  const { cart } = useCart();
  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Link to="/" className="shrink-0 text-2xl font-bold text-rausch tracking-heading">
          tapbazaar
        </Link>

        <div className="flex-1">
          <SearchBar />
        </div>

        <nav className="flex shrink-0 items-center gap-5 text-sm font-medium text-ink">
          <Link to="/products/new" className="hidden rounded-btn px-3 py-2 hover:bg-surface sm:inline-block">
            Sell an item
          </Link>
          <Link to="/cart" className="relative rounded-btn px-3 py-2 hover:bg-surface">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rausch text-xs font-semibold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <AccountMenu />
          ) : (
            <Link to="/signin" className="rounded-btn bg-ink px-4 py-2 text-white transition hover:shadow-hover">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;