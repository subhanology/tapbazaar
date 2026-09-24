import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SearchBar from "./SearchBar";
import AccountMenu from "./AccountMenu";

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.7 13.2a2 2 0 0 0 2 1.6h9.5a2 2 0 0 0 2-1.6L23 6H6" />
  </svg>
);

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;

const Navbar = () => {
  const { user } = useAuth();
  const { cart } = useCart();
  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-xl">
      <div className="page-shell flex min-h-[72px] items-center gap-5 py-3">
        <Link to="/" className="shrink-0 text-[22px] font-extrabold tracking-[-.05em] text-ink">
          tap<span className="text-primary">bazaar</span>
        </Link>

        <div className="hidden flex-1 md:block"><SearchBar /></div>

        <nav className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link to="/products/new" className="hidden items-center gap-1.5 rounded-btn border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink hover:border-primary hover:bg-primary-soft hover:text-primary sm:inline-flex">
            <PlusIcon /> Sell
          </Link>
          <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-secondary hover:bg-surface hover:text-ink" aria-label="Cart">
            <CartIcon />
            {itemCount > 0 && <span className="absolute right-0 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-white ring-2 ring-white">{itemCount}</span>}
          </Link>
          {user ? <AccountMenu /> : <Link to="/signin" className="btn-primary ml-1 px-4 py-2.5">Sign in</Link>}
        </nav>
      </div>
      <div className="page-shell pb-3 md:hidden"><SearchBar /></div>
    </header>
  );
};

export default Navbar;
