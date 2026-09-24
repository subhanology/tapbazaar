import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SearchBar from "./SearchBar";
import AccountMenu from "./AccountMenu";

/**
 * Renders the top navigation bar.
 * Includes branding, global search, selling link, dynamic cart counter badge, 
 * and user session actions (Sign In or AccountMenu).
 * 
 * @returns {JSX.Element} The Navbar component
 */
const Navbar = () => {
  const { user } = useAuth();

  const { cart } = useCart();
  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3.5">
        <Link to="/" className="group flex shrink-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-primary-soft text-sm font-semibold text-primary transition group-hover:border-primary/60"
          >
            t
          </span>
          <span className="font-display text-xl font-semibold tracking-heading text-link">
            tapbazaar
          </span>
        </Link>

        <div className="flex-1">
          <SearchBar />
        </div>

        <nav className="flex shrink-0 items-center gap-2 text-sm font-medium text-ink sm:gap-3">
          <Link
            to="/products/new"
            className="hidden rounded-btn px-3 py-2 text-link transition hover:bg-surface sm:inline-block"
          >
            Sell an item
          </Link>
          <Link
            to="/cart"
            className="relative rounded-btn p-2.5 text-link transition hover:bg-surface"
            aria-label="Cart"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <AccountMenu />
          ) : (
            <Link
              to="/signin"
              className="rounded-btn bg-link px-4 py-2.5 font-medium text-white transition hover:bg-link-dark hover:shadow-hover"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;